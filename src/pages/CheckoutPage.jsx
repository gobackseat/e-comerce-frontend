import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { createCheckoutSession, createGuestCheckoutSession } from "../utils/Api.js";
import { getToken } from "../utils/localstorage.js";
import { Button } from "../components/home-sections/ui/button.tsx";
import { Input } from "../components/home-sections/ui/input.tsx";
import { Label } from "../components/home-sections/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/home-sections/ui/card.tsx";
import { Separator } from "../components/home-sections/ui/separator.tsx";
import { CreditCard, User, MapPin, Phone, Mail, ArrowLeft, Lock } from "lucide-react";

// Checkout Form Component
const CheckoutForm = ({ formData, setFormData, cart, getTotalPrice, onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsProcessing(true);
    setError(null);

    try {
      const token = getToken();
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Prepare checkout data
      const checkoutData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        cartItems: cart.map(item => ({
          productId: item.productId?._id || item.productId || item.id,
          count: item.count || 1,
          price: item.productId?.price || item.price,
          name: item.productId?.name || item.name
        })),
        successUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout`
      };

      let result;
      if (token) {
        // Authenticated checkout
        result = await createCheckoutSession(checkoutData, token);
      } else {
        // Guest checkout
        result = await createGuestCheckoutSession(checkoutData);
      }
      
      if (result.success && result.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.sessionUrl;
      } else {
        setError("Failed to create checkout session: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.status === 401 || error.message?.includes('unauthorized')) {
        setError("Please log in again to checkout");
        localStorage.removeItem('E_COMMERCE_TOKEN');
      } else {
        setError("Checkout failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
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
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center mb-4">
              <Lock className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm text-gray-600">Secure payment powered by Stripe</span>
            </div>
            <p className="text-sm text-gray-600">
              You will be redirected to Stripe's secure payment page to complete your purchase.
              Your payment information will be handled securely by Stripe.
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${getTotalPrice().toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US"
  });

  useEffect(() => {
    // If cart is empty, redirect to home
    if (getTotalItems() === 0) {
      navigate('/');
      return;
    }
  }, [getTotalItems, navigate]);

  const handlePaymentSuccess = (sessionData) => {
    // Clear cart after successful payment
    clearCart();
    // Redirect to thank you page with session details
    navigate(`/thank-you?session_id=${sessionData.sessionId}`);
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
  };

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              formData={formData}
              setFormData={setFormData}
              cart={cart}
              getTotalPrice={getTotalPrice}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item._id || item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.productId?.name || item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.count || 1}</p>
                      </div>
                      <p className="font-medium">
                        ${((item.productId?.price || item.price) * (item.count || 1)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">Your payment is secure and encrypted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 