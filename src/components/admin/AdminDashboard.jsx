import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  StarIcon,
  EnvelopeIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  TagIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import ProductAdminPanel from './ProductAdminPanel';
import UserAdminPanel from './UserAdminPanel';
import MailAdminPanel from './MailAdminPanel';
import { Toaster, toast } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { config } from '../../utils/config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie } from 'recharts';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center border border-orange-200">
      <div className="text-orange-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={resetErrorBoundary} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Try again</button>
    </div>
  </div>
);

// Helper to get token from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifPanelRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;
    let isFetching = false;
    const fetchDashboardData = async () => {
      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      setError(null);
      try {
        let token = localStorage.getItem('token');
        if (!token) token = getCookie('token');
        // Fetch stats
        const statsRes = await fetch(`${config.baseURL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();
        setStats(statsData.data.overview); // Use .data.overview for stat cards
        setAnalytics(statsData.data); // Use .data for charts/lists

        // Fetch recent orders
        const ordersRes = await fetch(`${config.baseURL}/dashboard/recent-orders`, { headers: { Authorization: `Bearer ${token}` } });
        if (!ordersRes.ok) throw new Error('Failed to fetch recent orders');
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.data?.orders || []); // Use .data.orders

        // Fetch top products
        const productsRes = await fetch(`${config.baseURL}/dashboard/product-analytics`, { headers: { Authorization: `Bearer ${token}` } });
        if (!productsRes.ok) throw new Error('Failed to fetch top products');
        const productsData = await productsRes.json();
        setTopProducts(productsData.data?.topProducts || []); // Use .data.topProducts

        // Fetch user analytics
        const userAnalyticsRes = await fetch(`${config.baseURL}/dashboard/user-analytics`, { headers: { Authorization: `Bearer ${token}` } });
        if (!userAnalyticsRes.ok) throw new Error('Failed to fetch user analytics');
        const userAnalyticsData = await userAnalyticsRes.json();
        setUserAnalytics(userAnalyticsData.data);
      } catch (err) {
        setError(err.message);
        setAnalyticsError(err.message);
        toast.error(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
        setAnalyticsLoading(false);
        isFetching = false;
      }
      // Fetch products
      setProductsLoading(true);
      setProductsError(null);
      try {
        const productsRes = await fetch(`${config.baseURL}/products/`);
        const productsData = await productsRes.json();
        if (productsRes.ok && Array.isArray(productsData.data)) {
          setProducts(productsData.data);
        } else if (productsRes.ok && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        } else {
          setProducts([]);
          setProductsError(productsData.message || 'Failed to fetch products');
        }
      } catch (err) {
        setProducts([]);
        setProductsError('Failed to fetch products');
      } finally {
        setProductsLoading(false);
      }
      // Fetch users
      setUsersLoading(true);
      setUsersError(null);
      try {
        let token = localStorage.getItem('token');
        if (!token) token = getCookie('token');
        const usersRes = await fetch(`${config.baseURL}/users`, { headers: { Authorization: `Bearer ${token}` } });
        const usersData = await usersRes.json();
        if (usersRes.ok && Array.isArray(usersData.data)) {
          setUsers(usersData.data);
        } else if (usersRes.ok && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        } else if (usersRes.ok && usersData.data && Array.isArray(usersData.data.users)) {
          setUsers(usersData.data.users);
        } else {
          setUsers([]);
          setUsersError(usersData.message || 'Failed to fetch users');
        }
      } catch (err) {
        setUsers([]);
        setUsersError('Failed to fetch users');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchDashboardData();
    intervalId = setInterval(fetchDashboardData, 120000); // Refresh every 2 minutes
    return () => clearInterval(intervalId);
  }, [currentView]);

  // Improved notification polling
  useEffect(() => {
    let notifInterval;
    let isNotifFetching = false;
    const fetchNotifications = async () => {
      if (isNotifFetching) return;
      isNotifFetching = true;
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        let token = localStorage.getItem('token');
        if (!token) token = getCookie('token');
        // Fetch notifications from backend (implement this endpoint)
        const res = await fetch(`${config.baseURL}/dashboard/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        // data.notifications should be an array of { type, message, timestamp, read, importance }
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter(n => !n.read).length);
        // Show toast for important notifications
        (data.notifications || []).forEach(n => {
          if (!n.read && n.importance === 'high') toast(n.message);
        });
      } catch (err) {
        setNotificationsError(err.message);
      } finally {
        setNotificationsLoading(false);
        isNotifFetching = false;
      }
    };
    fetchNotifications();
    notifInterval = setInterval(fetchNotifications, 60000); // Poll every 1 minute
    return () => clearInterval(notifInterval);
  }, []);

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    // Optionally, send to backend to mark as read
    let token = localStorage.getItem('token');
    if (!token) token = getCookie('token');
    fetch(`${config.baseURL}/dashboard/notifications/mark-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Sidebar navigation items
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, iconSolid: HomeIconSolid, href: '/admin' },
    { id: 'product', name: 'Product', icon: ShoppingBagIcon, iconSolid: ShoppingBagIconSolid, href: '/admin/product' },
    { id: 'orders', name: 'Orders', icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid, href: '/admin/orders' },
    { id: 'users', name: 'Users', icon: UserGroupIcon, iconSolid: UserGroupIconSolid, href: '/admin/users' },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, iconSolid: ChartBarIconSolid, href: '/admin/analytics' },
    { id: 'mails', name: 'Mails', icon: EnvelopeIcon, iconSolid: EnvelopeIcon, href: '/admin/mails' },
    { id: 'settings', name: 'Settings', icon: CogIcon, iconSolid: CogIconSolid, href: '/admin/settings' }
  ];

  // Enhanced stat card with tooltip and clickable navigation
  const EnhancedStatsCard = ({ title, value, change, trend, icon: Icon, tooltip, onClick }) => (
    <div
      className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100 flex flex-col justify-between ${onClick ? 'hover:ring-2 hover:ring-orange-200' : ''}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      aria-label={title}
      role={onClick ? 'button' : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600 font-semibold">{title}</p>
            {tooltip && <span data-tooltip-id={`tip-${title}`} data-tooltip-content={tooltip}><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg></span>}
            {tooltip && <ReactTooltip id={`tip-${title}`} />}
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />}
            {trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>{change}</span>
          </div>
        </div>
        <div className="p-3 bg-orange-100 rounded-full">
          <Icon className="w-7 h-7 text-orange-600" />
        </div>
      </div>
    </div>
  );

  // Enhanced quick action button
  const EnhancedQuickAction = ({ title, description, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className="p-5 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow text-left flex flex-col gap-2 bg-gradient-to-br from-orange-50 to-white"
      aria-label={title}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Icon className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );

  // Enhanced recent orders widget
  const EnhancedRecentOrders = ({ orders }) => (
      <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">Recent Orders <ClipboardDocumentListIcon className="w-5 h-5 text-orange-500" /></h2>
      {loading ? <Skeleton height={40} count={4} /> : orders.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No recent orders.</div>
      ) : (
        <ul className="divide-y">
          {orders.slice(0, 5).map(order => (
            <li key={order.id} className="flex items-center justify-between py-3 hover:bg-orange-50 px-2 rounded transition">
              <div>
                <span className="font-medium text-gray-900">{order.customer?.name || 'Unknown'}</span>
                <span className="ml-2 text-xs text-gray-500">{order.id}</span>
      </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">${order.total}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{order.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Enhanced top products widget
  const EnhancedTopProducts = ({ products }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">Top Products <ShoppingBagIcon className="w-5 h-5 text-orange-500" /></h2>
      {loading ? <Skeleton height={40} count={4} /> : products.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No top products.</div>
      ) : (
        <ul className="divide-y">
          {products.slice(0, 5).map(product => (
            <li key={product.id || product._id} className="flex items-center justify-between py-3 hover:bg-orange-50 px-2 rounded transition">
              <div className="flex items-center gap-3">
                <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded bg-gray-200 object-cover" />
                <span className="font-medium text-gray-900">{product.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">${product.revenue?.toLocaleString() || '0.00'}</span>
                <span className="ml-2 text-xs text-gray-500">{product.sales || product.totalSold} sales</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Enhanced quick product management for single product
  const [productEdit, setProductEdit] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState(null);

  // Fetch single product for quick management
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${config.baseURL}/products/`);
        const data = await res.json();
        if (res.ok && data.data && data.data.product) {
          setProductEdit(data.data.product);
        } else if (res.ok && data.data && data.data.products && data.data.products.length > 0) {
          setProductEdit(data.data.products[0]);
        } else {
          setProductEdit(null);
        }
      } catch (err) {
        setProductEdit(null);
      }
    };
    fetchProduct();
  }, []);

  const handleProductChange = (field, value) => {
    setProductEdit(p => ({ ...p, [field]: value }));
  };

  const handleProductSave = async () => {
    setProductSaving(true);
    setProductError(null);
    try {
      const res = await fetch(`${config.baseURL}/products/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productEdit),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Product updated');
      } else {
        setProductError(data.message || 'Failed to update product');
        toast.error(data.message || 'Failed to update product');
      }
    } catch (err) {
      setProductError('Failed to update product');
      toast.error('Failed to update product');
    } finally {
      setProductSaving(false);
    }
  };

  // Enhanced quick product management card
  const QuickProductManagement = () => (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">Product Management <ShoppingBagIcon className="w-5 h-5 text-orange-500" /></h2>
      {!productEdit ? (
        <div className="text-gray-500 text-center py-8">No product found.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <img src={productEdit.image || 'https://via.placeholder.com/80'} alt={productEdit.name} className="w-24 h-24 rounded bg-gray-200 object-cover border" />
          <div className="flex-1 flex flex-col gap-2">
            <div>
              <span className="font-semibold">Name:</span> <span className="text-gray-900">{productEdit.name}</span>
            </div>
            <div className="flex gap-4 items-center">
              <label className="font-semibold">Price:</label>
              <input
                type="number"
                min="0"
                value={productEdit.price}
                onChange={e => handleProductChange('price', e.target.value)}
                className="border rounded px-2 py-1 w-28"
              />
              <span className="text-gray-500">USD</span>
            </div>
            <div className="flex gap-4 items-center">
              <label className="font-semibold">Inventory:</label>
              <input
                type="number"
                min="0"
                value={productEdit.countInStock}
                onChange={e => handleProductChange('countInStock', e.target.value)}
                className="border rounded px-2 py-1 w-28"
              />
              <span className="text-gray-500">units</span>
            </div>
            <button
              className="mt-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors w-fit"
              onClick={handleProductSave}
              disabled={productSaving}
            >
              {productSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {productError && <div className="text-red-600 text-sm mt-1">{productError}</div>}
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced dashboard overview
  const DashboardOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-100 via-white to-orange-50 rounded-lg shadow p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-4">
          <EnhancedQuickAction title="Add Product" description="Add a new product variant" icon={PlusIcon} onClick={() => setCurrentView('product')} />
          <EnhancedQuickAction title="View Orders" description="Check recent orders" icon={ClipboardDocumentListIcon} onClick={() => setCurrentView('orders')} />
          <EnhancedQuickAction title="Manage Users" description="User management" icon={UserGroupIcon} onClick={() => setCurrentView('users')} />
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatsCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString() ?? 'N/A'}
          change={stats?.orderGrowth ? `${stats.orderGrowth > 0 ? '+' : ''}${stats.orderGrowth}%` : 'N/A'}
          trend={stats?.orderGrowth > 0 ? 'up' : stats?.orderGrowth < 0 ? 'down' : 'neutral'}
          icon={ClipboardDocumentListIcon}
          tooltip="Total number of orders placed."
          onClick={() => setCurrentView('orders')}
        />
        <EnhancedStatsCard
          title="Total Revenue"
          value={stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : 'N/A'}
          change={stats?.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : 'N/A'}
          trend={stats?.revenueGrowth > 0 ? 'up' : stats?.revenueGrowth < 0 ? 'down' : 'neutral'}
          icon={CurrencyDollarIcon}
          tooltip="Total revenue from all orders."
          onClick={() => setCurrentView('analytics')}
        />
        <EnhancedStatsCard
          title="Total Products"
          value={stats?.totalProducts?.toLocaleString() ?? 'N/A'}
          change="-"
          trend="neutral"
          icon={ShoppingBagIcon}
          tooltip="Total number of products in your store."
          onClick={() => setCurrentView('product')}
        />
        <EnhancedStatsCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() ?? 'N/A'}
          change="-"
          trend="neutral"
          icon={UsersIcon}
          tooltip="Total number of registered users."
            onClick={() => setCurrentView('users')}
          />
        </div>
      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedRecentOrders orders={recentOrders} />
        <QuickProductManagement />
      </div>
    </div>
  );

  // Products Management Component
  const ProductsManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>
      <ProductsTable products={products} loading={productsLoading} error={productsError} />
    </div>
  );

  // Orders Management Component
  const OrdersManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>All Orders</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <OrdersTable orders={recentOrders} />
    </div>
  );

  // Users Management Component
  const UsersManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>
      <UsersTable users={users} loading={usersLoading} error={usersError} />
    </div>
  );

  // Enhanced analytics page with dynamic graphs and modern UI
  const EnhancedAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-100 via-white to-orange-50 rounded-lg shadow p-8 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600 text-lg">Track your store's growth and performance with real-time analytics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500">Revenue This Month</span>
          <span className="text-2xl font-bold text-gray-900">${analytics?.monthlyRevenue?.slice(-1)[0]?.revenue?.toLocaleString() || '0.00'}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500">Orders This Month</span>
          <span className="text-2xl font-bold text-gray-900">{analytics?.monthlyRevenue?.slice(-1)[0]?.orders || 0}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
          <span className="text-sm text-gray-500">New Users This Month</span>
          <span className="text-2xl font-bold text-gray-900">{userAnalytics?.userGrowth?.slice(-1)[0]?.users || 0}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales/Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Sales & Revenue <ChartBarIcon className="w-5 h-5 text-orange-500" /></h2>
          {analyticsLoading ? <Skeleton height={250} /> : analytics?.monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#f59e42" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#6366f1" name="Orders" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="text-gray-500 text-center py-8">No sales data available.</div>}
          </div>
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">User Growth <UserGroupIcon className="w-5 h-5 text-orange-500" /></h2>
          {analyticsLoading ? <Skeleton height={250} /> : userAnalytics?.userGrowth?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userAnalytics.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#f59e42" name="New Users" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="text-gray-500 text-center py-8">No user growth data available.</div>}
          </div>
        </div>
      {/* Orders by Status Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">Orders by Status <ClipboardDocumentListIcon className="w-5 h-5 text-orange-500" /></h2>
        {analyticsLoading ? <Skeleton height={250} /> : analytics?.ordersByStatus?.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} fill="#f59e42" label />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : <div className="text-gray-500 text-center py-8">No order status data available.</div>}
      </div>
    </div>
  );

  // Enhanced Settings Component
  const [settings, setSettings] = useState({ storeName: '', storeEmail: '', logo: '', adminName: '', adminAvatar: '', adminEmail: '', notificationEmail: '', notificationPrefs: { orders: true, users: true, inventory: true } });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch settings from backend
  useEffect(() => {
    setSettingsLoading(true);
    fetch(`${config.baseURL}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setSettingsLoading(false);
      })
      .catch(() => setSettingsLoading(false));
  }, []);

  const handleSettingsChange = (field, value) => {
    setSettings(s => ({ ...s, [field]: value }));
  };
  const handleNotificationPrefChange = (field) => {
    setSettings(s => ({ ...s, notificationPrefs: { ...s.notificationPrefs, [field]: !s.notificationPrefs[field] } }));
  };
  const handleSettingsSave = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      const res = await fetch(`${config.baseURL}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSaved(true);
        toast.success('Settings saved');
      } else {
        setSettingsError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setSettingsError('Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  // Logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    setSettingsLoading(true);
    try {
      const res = await fetch(`${config.baseURL}/admin/settings/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.logoUrl) {
        setSettings(s => ({ ...s, logo: data.logoUrl }));
        toast.success('Logo uploaded');
      } else {
        setSettingsError(data.error || 'Failed to upload logo');
      }
    } catch (err) {
      setSettingsError('Failed to upload logo');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Add admin avatar upload handler
  const handleAdminAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setSettingsLoading(true);
    try {
      const res = await fetch(`${config.baseURL}/admin/settings/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.avatarUrl) {
        setSettings(s => ({ ...s, adminAvatar: data.avatarUrl }));
        toast.success('Avatar uploaded');
      } else {
        setSettingsError(data.error || 'Failed to upload avatar');
      }
    } catch (err) {
      setSettingsError('Failed to upload avatar');
    } finally {
      setSettingsLoading(false);
    }
  };

  const EnhancedSettings = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {settingsLoading ? <Skeleton height={40} count={6} /> : (
        <>
          {/* Store Info */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Store Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold mb-1">Store Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={settings.storeName} onChange={e => handleSettingsChange('storeName', e.target.value)} />
      </div>
              <div>
                <label className="block font-semibold mb-1">Store Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={settings.storeEmail} onChange={e => handleSettingsChange('storeEmail', e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Store Logo</label>
                <input type="file" className="w-full border rounded px-3 py-2" onChange={handleLogoUpload} />
                {settings.logo && (
                  <div className="mt-2 flex items-center">
                    <img src={settings.logo} alt="Store Logo" className="w-10 h-10 rounded-full mr-2" />
                    <span className="text-sm text-gray-600">Current Logo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Admin Account */}
          <div>
            <h2 className="text-lg font-semibold mb-2 mt-6">Admin Account</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold mb-1">Admin Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={settings.adminName} onChange={e => handleSettingsChange('adminName', e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Admin Avatar</label>
                <input type="file" className="w-full border rounded px-3 py-2" onChange={handleAdminAvatarUpload} />
                {settings.adminAvatar && (
                  <div className="mt-2 flex items-center">
                    <img src={settings.adminAvatar} alt="Admin Avatar" className="w-10 h-10 rounded-full mr-2" />
                    <span className="text-sm text-gray-600">Current Avatar</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1">Admin Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={settings.adminEmail} onChange={e => handleSettingsChange('adminEmail', e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Change Password</label>
                <input type="password" className="w-full border rounded px-3 py-2" placeholder="New password" />
              </div>
            </div>
          </div>
          {/* Notification Preferences */}
          <div>
            <h2 className="text-lg font-semibold mb-2 mt-6">Notification Preferences</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notificationPrefs.orders} onChange={() => handleNotificationPrefChange('orders')} />
                Orders notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notificationPrefs.users} onChange={() => handleNotificationPrefChange('users')} />
                User notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notificationPrefs.inventory} onChange={() => handleNotificationPrefChange('inventory')} />
                Inventory notifications
              </label>
            </div>
          </div>
          {/* System Info */}
          <div>
            <h2 className="text-lg font-semibold mb-2 mt-6">System Info</h2>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div>Environment: <span className="font-mono">{process.env.NODE_ENV || 'development'}</span></div>
              <div>Version: <span className="font-mono">1.0.0</span></div>
              <div>Last Updated: <span className="font-mono">{new Date().toLocaleString()}</span></div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg" onClick={handleSettingsSave} disabled={settingsLoading}>{settingsLoading ? 'Saving...' : 'Save Settings'}</button>
            {settingsSaved && <span className="text-green-600 font-semibold">Settings saved!</span>}
            {settingsError && <span className="text-red-600 font-semibold">{settingsError}</span>}
          </div>
        </>
      )}
    </div>
  );

  // Settings Component
  const Settings = EnhancedSettings;

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardOverview />;
      case 'product': return <ProductAdminPanel />;
      case 'orders': return <OrdersManagement />;
      case 'users': return <UsersManagement />;
      case 'analytics': return <EnhancedAnalytics />;
      case 'mails': return <MailAdminPanel />;
      case 'settings': return <Settings />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-50 flex" role="main">
        <Toaster position="top-center" />
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">🐕 Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = currentView === item.id ? item.iconSolid : item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Top bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

                <div className="flex items-center space-x-3">
                  <img
                  className="w-8 h-8 rounded-full bg-gray-300 object-cover"
                  src={settings.adminAvatar || '/api/placeholder/32/32'}
                    alt="Admin Avatar"
                  />
                <span className="text-sm font-medium text-gray-700">{settings.adminName || 'Admin User'}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            <Suspense fallback={<Skeleton height={600} className="mb-8" count={2} />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCurrentView()}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, change, trend, icon: Icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center mt-2">
          {trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />}
          {trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />}
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {change}
          </span>
        </div>
      </div>
      <div className="p-3 bg-primary-100 rounded-full">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
);

// Quick Action Button Component
const QuickActionButton = ({ title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary-100 rounded-lg">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </button>
);

// Recent Orders Widget
const RecentOrdersWidget = ({ orders }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{order.id}</p>
            <p className="text-sm text-gray-600">{order.customer}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">${order.amount}</p>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Top Products Widget
const TopProductsWidget = ({ products }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-600">{product.sales} sales</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Products Table Component
const ProductsTable = ({ products = [], loading, error }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Products</h3>
    </div>
    <div className="overflow-x-auto">
      {loading ? (
        <Skeleton height={40} count={5} />
      ) : error ? (
        <div className="text-red-600 p-4">{error}</div>
      ) : (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No products found.</td></tr>
            ) : products.map((product) => (
              <tr key={product._id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                    <img className="h-10 w-10 rounded-lg bg-gray-300" src={product.image || 'https://via.placeholder.com/40'} alt={product.name} />
                <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                </div>
              </div>
            </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.countInStock}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.countInStock > 0 ? 'Active' : 'Out of Stock'}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-900"><EyeIcon className="w-4 h-4" /></button>
                <button className="text-blue-600 hover:text-blue-900"><PencilIcon className="w-4 h-4" /></button>
                <button className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
            ))}
        </tbody>
      </table>
      )}
    </div>
  </div>
);

// Orders Table Component
const OrdersTable = ({ orders = [] }) => {
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const handleEditClick = (order) => {
    setEditingOrderId(order.id);
    setNewStatus(order.status);
    setStatusError(null);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleStatusSave = async (order) => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      let token = localStorage.getItem('token');
      if (!token) token = getCookie('token');
      const res = await fetch(`${config.baseURL}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Order status updated');
        setEditingOrderId(null);
      } else {
        setStatusError(data.message || 'Failed to update status');
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      setStatusError('Failed to update status');
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Orders</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-8 text-gray-500">No orders found.</td></tr>
          ) : orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                  {editingOrderId === order.id ? (
                    <select value={newStatus} onChange={handleStatusChange} className="border rounded px-2 py-1">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
                  )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                    {editingOrderId === order.id ? (
                      <>
                        <button className="text-green-600 hover:text-green-900" onClick={() => handleStatusSave(order)} disabled={statusLoading}>
                          {statusLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" onClick={() => setEditingOrderId(null)} disabled={statusLoading}>
                          Cancel
                        </button>
                        {statusError && <span className="text-xs text-red-600 ml-2">{statusError}</span>}
                      </>
                    ) : (
                      <>
                        <button className="text-primary-600 hover:text-primary-900" onClick={() => handleEditClick(order)}><PencilIcon className="w-4 h-4" /></button>
                  <button className="text-primary-600 hover:text-primary-900"><EyeIcon className="w-4 h-4" /></button>
                      </>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

// Users Table Component
const UsersTable = ({ users = [], loading, error }) => {
  console.log('Users in state:', users);
  return (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Users</h3>
    </div>
    <div className="overflow-x-auto">
        {loading ? (
          <Skeleton height={40} count={5} />
        ) : error && error !== 'Users retrieved' ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(users) && users.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td></tr>
              ) : Array.isArray(users) ? users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.ordersCount || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.totalSpent || '0.00'}</td>
          </tr>
              )) : null}
        </tbody>
      </table>
        )}
    </div>
  </div>
);
};

export default AdminDashboard;
