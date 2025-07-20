import React, { useState, useEffect, Suspense } from 'react';
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        let token = localStorage.getItem('token');
        if (!token) token = getCookie('token');
        // Fetch stats
        const statsRes = await fetch(config.baseURL + '/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } });
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch recent orders
        const ordersRes = await fetch(config.baseURL + '/dashboard/recent-orders', { headers: { Authorization: `Bearer ${token}` } });
        if (!ordersRes.ok) throw new Error('Failed to fetch recent orders');
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders || []);

        // Fetch top products
        const productsRes = await fetch(config.baseURL + '/dashboard/product-analytics', { headers: { Authorization: `Bearer ${token}` } });
        if (!productsRes.ok) throw new Error('Failed to fetch top products');
        const productsData = await productsRes.json();
        setTopProducts(productsData.topProducts || []);
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentView]);

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

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 'N/A'}
          change={stats?.ordersToday ? `${stats.ordersToday - stats.ordersYesterday > 0 ? '+' : ''}${stats.ordersToday - stats.ordersYesterday}%` : 'N/A'}
          trend={stats?.ordersToday > stats?.ordersYesterday ? 'up' : 'down'}
          icon={ClipboardDocumentListIcon}
        />
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : 'N/A'}
          change={stats?.revenueToday ? `${stats.revenueToday - stats.revenueYesterday > 0 ? '+' : ''}${stats.revenueToday - stats.revenueYesterday}%` : 'N/A'}
          trend={stats?.revenueToday > stats?.revenueYesterday ? 'up' : 'down'}
          icon={CurrencyDollarIcon}
        />
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 'N/A'}
          change="0%"
          trend="neutral"
          icon={ShoppingBagIcon}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 'N/A'}
          change="0%"
          trend="neutral"
          icon={UsersIcon}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            title="Add Product"
            description="Add a new product variant"
            icon={PlusIcon}
            onClick={() => setCurrentView('add-product')}
          />
          <QuickActionButton
            title="View Orders"
            description="Check recent orders"
            icon={EyeIcon}
            onClick={() => setCurrentView('orders')}
          />
          <QuickActionButton
            title="Manage Users"
            description="User management"
            icon={UserGroupIcon}
            onClick={() => setCurrentView('users')}
          />
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersWidget orders={recentOrders} />
        <TopProductsWidget products={topProducts} />
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

      <ProductsTable />
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

      <UsersTable />
    </div>
  );

  // Analytics Component
  const Analytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Detailed insights and reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Sales Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">User Growth Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Component
  const Settings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SettingsCard title="General Settings" description="Basic store configuration" />
        <SettingsCard title="Payment Settings" description="Payment gateways and methods" />
        <SettingsCard title="Shipping Settings" description="Shipping zones and rates" />
        <SettingsCard title="Email Settings" description="Email templates and notifications" />
        <SettingsCard title="Security Settings" description="Security and access control" />
        <SettingsCard title="Advanced Settings" description="Developer and advanced options" />
      </div>
    </div>
  );

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardOverview />;
      case 'product': return <ProductAdminPanel />;
      case 'orders': return <OrdersManagement />;
      case 'users': return <UserAdminPanel />;
      case 'analytics': return <Analytics />;
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

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3">
                  <img
                    className="w-8 h-8 rounded-full bg-gray-300"
                    src="/api/placeholder/32/32"
                    alt="Admin Avatar"
                  />
                  <span className="text-sm font-medium text-gray-700">Admin User</span>
                </div>
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
const ProductsTable = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Products</h3>
    </div>
    <div className="overflow-x-auto">
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
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-lg bg-gray-300" src={'https://via.placeholder.com/40'} alt="Placeholder" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Premium Dogs Backseat Extender</div>
                  <div className="text-sm text-gray-500">SKU: PBE-001</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$49.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">150</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-900"><EyeIcon className="w-4 h-4" /></button>
                <button className="text-blue-600 hover:text-blue-900"><PencilIcon className="w-4 h-4" /></button>
                <button className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-lg bg-gray-300" src={'https://via.placeholder.com/40'} alt="Placeholder" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Deluxe Dogs Backseat Extender</div>
                  <div className="text-sm text-gray-500">SKU: DBE-001</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$79.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">75</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-900"><EyeIcon className="w-4 h-4" /></button>
                <button className="text-blue-600 hover:text-blue-900"><PencilIcon className="w-4 h-4" /></button>
                <button className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Orders Table Component
const OrdersTable = ({ orders = [] }) => (
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
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-900"><EyeIcon className="w-4 h-4" /></button>
                  <button className="text-blue-600 hover:text-blue-900"><PencilIcon className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Users Table Component
const UsersTable = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Users</h3>
    </div>
    <div className="overflow-x-auto">
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
          {/* Example row */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Doe</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">john@example.com</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$250.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;
