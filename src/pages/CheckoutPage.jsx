import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createCheckoutSession, createGuestCheckoutSession } from '../utils/Api';
import { getToken } from '../utils/localstorage';
import { Button } from '../components/home-sections/ui/button.tsx';
import { Input } from '../components/home-sections/ui/input.tsx';
import { Label } from '../components/home-sections/ui/label.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/home-sections/ui/card.tsx';
import { Separator } from '../components/home-sections/ui/separator.tsx';
import { AlertCircle, CheckCircle, CreditCard, Lock, ShoppingCart, User, MapPin, Truck, Shield } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const token = getToken();

  // Form data with default values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Real-time validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          errors[name] = 'This field is required';
        } else if (value.length < 2) {
          errors[name] = 'Must be at least 2 characters';
        } else {
          delete errors[name];
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors[name] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[name] = 'Please enter a valid email address';
        } else {
          delete errors[name];
        }
        break;
      case 'phone':
        if (!value.trim()) {
          errors[name] = 'Phone number is required';
        } else if (!/^[\+]?[1-9][\d]{3,14}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          errors[name] = 'Please enter a valid phone number';
        } else {
          delete errors[name];
        }
        break;
      case 'address':
        if (!value.trim()) {
          errors[name] = 'Address is required';
        } else if (value.length < 5) {
          errors[name] = 'Please enter a complete address';
        } else {
          delete errors[name];
        }
        break;
      case 'city':
        if (!value.trim()) {
          errors[name] = 'City is required';
        } else if (value.length < 2) {
          errors[name] = 'Please enter a valid city name';
        } else {
          delete errors[name];
        }
        break;
      case 'state':
        if (!value.trim()) {
          errors[name] = 'State/Province is required';
        } else {
          delete errors[name];
        }
        break;
      case 'postalCode':
        if (!value.trim()) {
          errors[name] = 'Postal code is required';
        } else if (!/^[A-Za-z0-9\s\-]{3,10}$/.test(value)) {
          errors[name] = 'Please enter a valid postal code';
        } else {
          delete errors[name];
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    
    // Clear general errors when user starts typing
    if (error) setError(null);
  };

  // Comprehensive form validation
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'country') { // Country has default value
        validateField(key, formData[key]);
      }
    });
    
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      setError('Please fix the errors above before proceeding');
    }
    return !hasErrors;
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const price = item.productId?.price || item.price || 0;
    const count = item.count || 1;
    return sum + (price * count);
  }, 0);

  const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Prepare checkout data with comprehensive validation
      const checkoutData = {
        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim()
        },
        shippingAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country
        },
        cartItems: cart.map(item => ({
          productId: item.productId?._id || item.productId || item.id,
          count: item.count || 1,
          price: item.productId?.price || item.price,
          name: item.productId?.name || item.name
        })),
        orderSummary: {
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          total: total
        },
        successUrl: `https://gobackseatextender.us/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `https://gobackseatextender.us/`
      };

      // Enhanced logging for debugging
      console.log('=== CHECKOUT DEBUG INFO ===');
      console.log('User token:', token ? 'Present' : 'Not present');
      console.log('Cart items:', cart.length);
      console.log('Checkout data:', JSON.stringify(checkoutData, null, 2));
      console.log('API Base URL:', window.location.origin);

      let result;
      if (token) {
        console.log('Attempting authenticated checkout...');
        result = await createCheckoutSession(checkoutData, token);
      } else {
        console.log('Attempting guest checkout...');
        result = await createGuestCheckoutSession(checkoutData);
      }
      
      console.log('Checkout result:', result);

      if (result && result.success && result.sessionUrl) {
        setCurrentStep(3);
        setSuccess('Redirecting to secure payment...');
        
        // Small delay to show success state
        setTimeout(() => {
          window.location.href = result.sessionUrl;
        }, 1500);
      } else {
        throw new Error(result?.error || 'Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      setCurrentStep(1);
      
      // Enhanced error handling
      let errorMessage = 'Checkout failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to checkout';
        localStorage.removeItem('E_COMMERCE_TOKEN');
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid checkout data. Please check your information.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step progress indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
        </div>
        <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
        </div>
        <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
          {currentStep > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
        </div>
      </div>
      <div className="ml-8 text-sm text-gray-600">
        {currentStep === 1 && 'Enter Details'}
        {currentStep === 2 && 'Processing...'}
        {currentStep === 3 && 'Redirecting...'}
      </div>
    </div>
  );

  // Loading overlay
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <StepIndicator />
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-orange-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep === 2 ? 'Processing Your Order...' : 'Redirecting to Payment...'}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentStep === 2 ? 'Please wait while we prepare your checkout session.' : 'You will be redirected to our secure payment processor.'}
            </p>
            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
              <div className="h-2 bg-orange-600 rounded-full animate-pulse" style={{ width: currentStep === 2 ? '60%' : '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <StepIndicator />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your order securely and safely</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={validationErrors.firstName ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={validationErrors.lastName ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={validationErrors.email ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={validationErrors.phone ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={validationErrors.address ? 'border-red-500' : ''}
                      required
                    />
                    {validationErrors.address && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={validationErrors.city ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={validationErrors.state ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.state && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={validationErrors.postalCode ? 'border-red-500' : ''}
                        required
                      />
                      {validationErrors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.postalCode}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing || Object.keys(validationErrors).length > 0}
                className="w-full py-4 text-lg font-semibold"
              >
                <Lock className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)} Securely`}
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-2" />
                Secured by 256-bit SSL encryption
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item, index) => {
                    const price = item.productId?.price || item.price || 0;
                    const name = item.productId?.name || item.name || 'Unknown Product';
                    const count = item.count || 1;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <img
                          src={item.productId?.image || "/Assets/imgs/backseat-extender-for-dogs (1).png"}
                          alt={name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-sm text-gray-600">Qty: {count}</p>
                        </div>
                        <p className="font-semibold">${(price * count).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      Shipping
                    </span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {subtotal < 100 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 