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
        success_url: "https://gobackseatextender.us/thank-you",
        cancel_url: "https://gobackseatextender.us/"
      };

             // Enhanced logging for debugging
       console.log('=== CHECKOUT DEBUG INFO ===');
       console.log('User token:', token ? 'Present' : 'Not present');
       console.log('Cart items:', cart.length);
       console.log('Current domain:', window.location.origin);
       console.log('Success URL:', checkoutData.success_url);
       console.log('Cancel URL:', checkoutData.cancel_url);
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
                         <option value="AF">Afghanistan</option>
                         <option value="AL">Albania</option>
                         <option value="DZ">Algeria</option>
                         <option value="AS">American Samoa</option>
                         <option value="AD">Andorra</option>
                         <option value="AO">Angola</option>
                         <option value="AI">Anguilla</option>
                         <option value="AQ">Antarctica</option>
                         <option value="AG">Antigua and Barbuda</option>
                         <option value="AR">Argentina</option>
                         <option value="AM">Armenia</option>
                         <option value="AW">Aruba</option>
                         <option value="AU">Australia</option>
                         <option value="AT">Austria</option>
                         <option value="AZ">Azerbaijan</option>
                         <option value="BS">Bahamas</option>
                         <option value="BH">Bahrain</option>
                         <option value="BD">Bangladesh</option>
                         <option value="BB">Barbados</option>
                         <option value="BY">Belarus</option>
                         <option value="BE">Belgium</option>
                         <option value="BZ">Belize</option>
                         <option value="BJ">Benin</option>
                         <option value="BM">Bermuda</option>
                         <option value="BT">Bhutan</option>
                         <option value="BO">Bolivia</option>
                         <option value="BA">Bosnia and Herzegovina</option>
                         <option value="BW">Botswana</option>
                         <option value="BV">Bouvet Island</option>
                         <option value="BR">Brazil</option>
                         <option value="IO">British Indian Ocean Territory</option>
                         <option value="BN">Brunei Darussalam</option>
                         <option value="BG">Bulgaria</option>
                         <option value="BF">Burkina Faso</option>
                         <option value="BI">Burundi</option>
                         <option value="KH">Cambodia</option>
                         <option value="CM">Cameroon</option>
                         <option value="CA">Canada</option>
                         <option value="CV">Cape Verde</option>
                         <option value="KY">Cayman Islands</option>
                         <option value="CF">Central African Republic</option>
                         <option value="TD">Chad</option>
                         <option value="CL">Chile</option>
                         <option value="CN">China</option>
                         <option value="CX">Christmas Island</option>
                         <option value="CC">Cocos (Keeling) Islands</option>
                         <option value="CO">Colombia</option>
                         <option value="KM">Comoros</option>
                         <option value="CG">Congo</option>
                         <option value="CD">Congo, Democratic Republic</option>
                         <option value="CK">Cook Islands</option>
                         <option value="CR">Costa Rica</option>
                         <option value="CI">Côte d'Ivoire</option>
                         <option value="HR">Croatia</option>
                         <option value="CU">Cuba</option>
                         <option value="CY">Cyprus</option>
                         <option value="CZ">Czech Republic</option>
                         <option value="DK">Denmark</option>
                         <option value="DJ">Djibouti</option>
                         <option value="DM">Dominica</option>
                         <option value="DO">Dominican Republic</option>
                         <option value="EC">Ecuador</option>
                         <option value="EG">Egypt</option>
                         <option value="SV">El Salvador</option>
                         <option value="GQ">Equatorial Guinea</option>
                         <option value="ER">Eritrea</option>
                         <option value="EE">Estonia</option>
                         <option value="ET">Ethiopia</option>
                         <option value="FK">Falkland Islands</option>
                         <option value="FO">Faroe Islands</option>
                         <option value="FJ">Fiji</option>
                         <option value="FI">Finland</option>
                         <option value="FR">France</option>
                         <option value="GF">French Guiana</option>
                         <option value="PF">French Polynesia</option>
                         <option value="TF">French Southern Territories</option>
                         <option value="GA">Gabon</option>
                         <option value="GM">Gambia</option>
                         <option value="GE">Georgia</option>
                         <option value="DE">Germany</option>
                         <option value="GH">Ghana</option>
                         <option value="GI">Gibraltar</option>
                         <option value="GR">Greece</option>
                         <option value="GL">Greenland</option>
                         <option value="GD">Grenada</option>
                         <option value="GP">Guadeloupe</option>
                         <option value="GU">Guam</option>
                         <option value="GT">Guatemala</option>
                         <option value="GG">Guernsey</option>
                         <option value="GN">Guinea</option>
                         <option value="GW">Guinea-Bissau</option>
                         <option value="GY">Guyana</option>
                         <option value="HT">Haiti</option>
                         <option value="HM">Heard Island</option>
                         <option value="VA">Holy See (Vatican City)</option>
                         <option value="HN">Honduras</option>
                         <option value="HK">Hong Kong</option>
                         <option value="HU">Hungary</option>
                         <option value="IS">Iceland</option>
                         <option value="IN">India</option>
                         <option value="ID">Indonesia</option>
                         <option value="IR">Iran</option>
                         <option value="IQ">Iraq</option>
                         <option value="IE">Ireland</option>
                         <option value="IM">Isle of Man</option>
                         <option value="IL">Israel</option>
                         <option value="IT">Italy</option>
                         <option value="JM">Jamaica</option>
                         <option value="JP">Japan</option>
                         <option value="JE">Jersey</option>
                         <option value="JO">Jordan</option>
                         <option value="KZ">Kazakhstan</option>
                         <option value="KE">Kenya</option>
                         <option value="KI">Kiribati</option>
                         <option value="KP">North Korea</option>
                         <option value="KR">South Korea</option>
                         <option value="KW">Kuwait</option>
                         <option value="KG">Kyrgyzstan</option>
                         <option value="LA">Laos</option>
                         <option value="LV">Latvia</option>
                         <option value="LB">Lebanon</option>
                         <option value="LS">Lesotho</option>
                         <option value="LR">Liberia</option>
                         <option value="LY">Libya</option>
                         <option value="LI">Liechtenstein</option>
                         <option value="LT">Lithuania</option>
                         <option value="LU">Luxembourg</option>
                         <option value="MO">Macao</option>
                         <option value="MK">North Macedonia</option>
                         <option value="MG">Madagascar</option>
                         <option value="MW">Malawi</option>
                         <option value="MY">Malaysia</option>
                         <option value="MV">Maldives</option>
                         <option value="ML">Mali</option>
                         <option value="MT">Malta</option>
                         <option value="MH">Marshall Islands</option>
                         <option value="MQ">Martinique</option>
                         <option value="MR">Mauritania</option>
                         <option value="MU">Mauritius</option>
                         <option value="YT">Mayotte</option>
                         <option value="MX">Mexico</option>
                         <option value="FM">Micronesia</option>
                         <option value="MD">Moldova</option>
                         <option value="MC">Monaco</option>
                         <option value="MN">Mongolia</option>
                         <option value="ME">Montenegro</option>
                         <option value="MS">Montserrat</option>
                         <option value="MA">Morocco</option>
                         <option value="MZ">Mozambique</option>
                         <option value="MM">Myanmar</option>
                         <option value="NA">Namibia</option>
                         <option value="NR">Nauru</option>
                         <option value="NP">Nepal</option>
                         <option value="NL">Netherlands</option>
                         <option value="NC">New Caledonia</option>
                         <option value="NZ">New Zealand</option>
                         <option value="NI">Nicaragua</option>
                         <option value="NE">Niger</option>
                         <option value="NG">Nigeria</option>
                         <option value="NU">Niue</option>
                         <option value="NF">Norfolk Island</option>
                         <option value="MP">Northern Mariana Islands</option>
                         <option value="NO">Norway</option>
                         <option value="OM">Oman</option>
                         <option value="PK">Pakistan</option>
                         <option value="PW">Palau</option>
                         <option value="PS">Palestine</option>
                         <option value="PA">Panama</option>
                         <option value="PG">Papua New Guinea</option>
                         <option value="PY">Paraguay</option>
                         <option value="PE">Peru</option>
                         <option value="PH">Philippines</option>
                         <option value="PN">Pitcairn</option>
                         <option value="PL">Poland</option>
                         <option value="PT">Portugal</option>
                         <option value="PR">Puerto Rico</option>
                         <option value="QA">Qatar</option>
                         <option value="RE">Réunion</option>
                         <option value="RO">Romania</option>
                         <option value="RU">Russian Federation</option>
                         <option value="RW">Rwanda</option>
                         <option value="BL">Saint Barthélemy</option>
                         <option value="SH">Saint Helena</option>
                         <option value="KN">Saint Kitts and Nevis</option>
                         <option value="LC">Saint Lucia</option>
                         <option value="MF">Saint Martin</option>
                         <option value="PM">Saint Pierre and Miquelon</option>
                         <option value="VC">Saint Vincent and the Grenadines</option>
                         <option value="WS">Samoa</option>
                         <option value="SM">San Marino</option>
                         <option value="ST">Sao Tome and Principe</option>
                         <option value="SA">Saudi Arabia</option>
                         <option value="SN">Senegal</option>
                         <option value="RS">Serbia</option>
                         <option value="SC">Seychelles</option>
                         <option value="SL">Sierra Leone</option>
                         <option value="SG">Singapore</option>
                         <option value="SK">Slovakia</option>
                         <option value="SI">Slovenia</option>
                         <option value="SB">Solomon Islands</option>
                         <option value="SO">Somalia</option>
                         <option value="ZA">South Africa</option>
                         <option value="GS">South Georgia</option>
                         <option value="ES">Spain</option>
                         <option value="LK">Sri Lanka</option>
                         <option value="SD">Sudan</option>
                         <option value="SR">Suriname</option>
                         <option value="SJ">Svalbard and Jan Mayen</option>
                         <option value="SZ">Eswatini</option>
                         <option value="SE">Sweden</option>
                         <option value="CH">Switzerland</option>
                         <option value="SY">Syrian Arab Republic</option>
                         <option value="TW">Taiwan</option>
                         <option value="TJ">Tajikistan</option>
                         <option value="TZ">Tanzania</option>
                         <option value="TH">Thailand</option>
                         <option value="TL">Timor-Leste</option>
                         <option value="TG">Togo</option>
                         <option value="TK">Tokelau</option>
                         <option value="TO">Tonga</option>
                         <option value="TT">Trinidad and Tobago</option>
                         <option value="TN">Tunisia</option>
                         <option value="TR">Turkey</option>
                         <option value="TM">Turkmenistan</option>
                         <option value="TC">Turks and Caicos Islands</option>
                         <option value="TV">Tuvalu</option>
                         <option value="UG">Uganda</option>
                         <option value="UA">Ukraine</option>
                         <option value="AE">United Arab Emirates</option>
                         <option value="GB">United Kingdom</option>
                         <option value="US">United States</option>
                         <option value="UM">United States Minor Outlying Islands</option>
                         <option value="UY">Uruguay</option>
                         <option value="UZ">Uzbekistan</option>
                         <option value="VU">Vanuatu</option>
                         <option value="VE">Venezuela</option>
                         <option value="VN">Vietnam</option>
                         <option value="VG">Virgin Islands, British</option>
                         <option value="VI">Virgin Islands, U.S.</option>
                         <option value="WF">Wallis and Futuna</option>
                         <option value="EH">Western Sahara</option>
                         <option value="YE">Yemen</option>
                         <option value="ZM">Zambia</option>
                         <option value="ZW">Zimbabwe</option>
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