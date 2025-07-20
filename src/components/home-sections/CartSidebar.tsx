"use client"

import React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { Label } from "../ui/label.jsx";
import { useCart } from "../../contexts/CartContext.jsx";

export default function CartSidebar() {
  const {
    cart,
    removeFromCart,
    updateCartItem,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    getTotalPrice,
    getTotalItems,
    loading,
    error,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("Order placed successfully! Thank you for your purchase.");
    clearCart();
    setIsCartOpen(false);
    setIsCheckingOut(false);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setIsCartOpen(false)} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              {getTotalItems() > 0 && (
                <Badge className="bg-orange-600 text-white animate-bounce">{getTotalItems()}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-gray-500 text-lg">Loading cart...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 font-semibold">{error}</div>
            ) : cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <Button className="mt-4" onClick={() => setIsCartOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item._id || item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.productId?.image || item.image || "/Assets/imgs/backseat-extender-for-dogs (1).png"}
                        alt={item.productId?.name || item.name || "Product"}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.productId?.name || item.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.count}</p>
                        <p className="text-lg font-bold text-orange-600">${(item.productId?.price || item.price || 0).toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItem(item.productId?._id || item.id, Math.max(1, item.count - 1))}
                            disabled={item.count <= 1 || loading}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="px-3 py-1 border border-gray-300 rounded text-sm font-medium">
                            {item.count}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItem(item.productId?._id || item.id, item.count + 1)}
                            disabled={loading}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item._id || item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && !loading && !error && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-orange-600">${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || loading}
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsCartOpen(false)}>
                  Continue Shopping
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={loading}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
