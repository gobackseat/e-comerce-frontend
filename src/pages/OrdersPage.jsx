import React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { Api } from "../utils/Api";
import { Link, useNavigate } from "react-router-dom";
import Header from '../components/home-sections/Header.tsx';
import Footer from '../components/home-sections/Footer.tsx';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    Api.getRequest("/orders/myorders")
      .then(({ statusCode, data }) => {
        if (statusCode !== 200) throw new Error("Failed to fetch orders");
        setOrders(data.orders || []);
      })
      .catch((err) => setError(err.message || "Failed to fetch orders"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) return <div className="p-8 text-center">Loading your orders...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
          {orders.length === 0 ? (
            <div className="text-gray-600">You have no orders yet.</div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order._id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">Order #{order._id.slice(-6)}</div>
                    <div className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Status: <span className="font-medium text-orange-700">{order.status || 'Processing'}</span></div>
                    <div className="text-sm text-gray-500">Total: <span className="font-semibold">${order.totalPrice?.toFixed(2) || '0.00'}</span></div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Link to={`/orders/${order._id}`} className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">View Details</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage; 