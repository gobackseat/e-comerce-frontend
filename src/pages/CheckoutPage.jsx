import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getTotalItems } = useCart();

  useEffect(() => {
    // If cart is empty, redirect to home
    if (getTotalItems() === 0) {
      navigate('/');
      return;
    }
    
    // Redirect to home page where they can use the cart sidebar for checkout
    navigate('/');
  }, [getTotalItems, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
} 