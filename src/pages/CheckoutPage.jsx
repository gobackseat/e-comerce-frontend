import React, { useState } from "react";
import { useCart } from "../contexts/CartContext.jsx";
import { createOrder, createPaymentIntent } from "../utils/Api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const { cart, clearCart, getTotalPrice } = useCart();
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const token = localStorage.getItem("token");

  const handleInput = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    for (const key of ["firstName", "lastName", "address", "city", "state", "postalCode", "country", "phone", "email"]) {
      if (!shipping[key]) {
        setError(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(shipping.email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Create order in backend
      const orderData = {
        orderItems: cart.map((item) => ({
          product: item.productId?._id || item.id,
          quantity: item.count,
        })),
        shippingAddress: shipping,
        paymentMethod: "stripe",
      };
      const order = await createOrder(orderData, token);
      setOrderId(order._id);
      // 2. Create Stripe payment intent
      const paymentIntent = await createPaymentIntent(order._id, token);
      const clientSecret = paymentIntent.clientSecret || paymentIntent.data?.clientSecret;
      // 3. Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${shipping.firstName} ${shipping.lastName}`,
            email: shipping.email,
            address: {
              line1: shipping.address,
              city: shipping.city,
              state: shipping.state,
              postal_code: shipping.postalCode,
              country: shipping.country,
            },
          },
        },
      });
      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      toast.success("Order placed successfully!");
      clearCart();
    } catch (err) {
      setError(err.message || "Checkout failed");
      toast.error(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Thank you for your order!</h2>
        <p className="mb-2">Your order has been placed successfully.</p>
        {orderId && <p className="text-sm text-gray-500">Order ID: {orderId}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-xl space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Checkout</h1>
      {/* Order Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <ul className="divide-y divide-gray-200 mb-4">
          {cart.map((item) => (
            <li key={item._id || item.id} className="py-2 flex justify-between items-center">
              <span>{item.productId?.name || item.name} x {item.count}</span>
              <span>${((item.productId?.price || item.price || 0) * item.count).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span className="text-orange-600">${getTotalPrice().toFixed(2)}</span>
        </div>
      </div>
      {/* Shipping Address */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="firstName" value={shipping.firstName} onChange={handleInput} required placeholder="First Name" className="input" />
          <input name="lastName" value={shipping.lastName} onChange={handleInput} required placeholder="Last Name" className="input" />
          <input name="address" value={shipping.address} onChange={handleInput} required placeholder="Address" className="input md:col-span-2" />
          <input name="city" value={shipping.city} onChange={handleInput} required placeholder="City" className="input" />
          <input name="state" value={shipping.state} onChange={handleInput} required placeholder="State" className="input" />
          <input name="postalCode" value={shipping.postalCode} onChange={handleInput} required placeholder="Postal Code" className="input" />
          <input name="country" value={shipping.country} onChange={handleInput} required placeholder="Country" className="input" />
          <input name="phone" value={shipping.phone} onChange={handleInput} required placeholder="Phone" className="input" />
          <input name="email" value={shipping.email || ''} onChange={handleInput} required placeholder="Email" className="input md:col-span-2" />
        </div>
      </div>
      {/* Payment */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Payment</h2>
        <div className="p-4 border rounded-lg bg-gray-50">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>
      {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-lg shadow-lg hover:from-orange-700 hover:to-amber-700 transition-all duration-200 disabled:opacity-50"
        disabled={loading || !stripe || !elements}
      >
        {loading ? "Processing..." : "Pay & Place Order"}
      </button>
    </form>
  );
}

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage; 