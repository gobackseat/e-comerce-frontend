import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { verifyPayment, getCheckoutStatus } from '../utils/Api';
import { getToken } from '../utils/localstorage';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    const verifyOrder = async () => {
      try {
        const token = getToken();
        
        // First check the session status (works for both authenticated and guest users)
        const statusResult = await getCheckoutStatus(sessionId, token);
        
        if (statusResult.session.payment_status === 'paid') {
          // Verify the payment and get order details
          const result = await verifyPayment(sessionId, token);
          if (result.success) {
            setOrder(result.order);
          } else {
            setError('Payment verification failed');
          }
        } else {
          setError('Payment not completed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/cart')} className="w-full">
              Return to Cart
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600">Your payment has been processed successfully.</p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Order ID:</span> {order._id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className="ml-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                  <p><span className="font-medium">Payment Status:</span> 
                    <span className="ml-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Paid
                    </span>
                  </p>
                  <p><span className="font-medium">Total Amount:</span> ${order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image || "/Assets/imgs/backseat-extender-for-dogs (1).png"}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.count}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${(item.price * item.count).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Order Confirmed</h3>
              <p className="text-sm text-gray-600">We've received your order and are preparing it for shipment.</p>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Shipping Soon</h3>
              <p className="text-sm text-gray-600">You'll receive a shipping confirmation email with tracking details.</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Delivery</h3>
              <p className="text-sm text-gray-600">Your order will arrive within 3-5 business days.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-3">
          <Button onClick={() => navigate('/orders')} className="w-full md:w-auto">
            View My Orders
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')} className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile')} className="w-full sm:w-auto">
              My Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 