import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import store from "./store";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsAdmin } from "./store/slices/authSlice";
import AuthSlider from "./components/auth/AuthSlider";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import EmailVerification from "./components/auth/EmailVerification";
import UserProfile from "./components/auth/UserProfile";
import CartSidebar from "./components/home-sections/CartSidebar.tsx";
import Header from './components/home-sections/Header.tsx';
import Footer from './components/home-sections/Footer.tsx';

// Lazy load components for better performance
const Home = React.lazy(() => import("./pages/Home"));
const ProductPage = React.lazy(() => import("./pages/ProductPage"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const OrdersPage = React.lazy(() => import("./pages/OrdersPage"));
const OrderDetailsPage = React.lazy(() => import("./pages/OrderDetailsPage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const WishlistPage = React.lazy(() => import("./pages/WishlistPage.jsx"));

// Admin Components
const AdminDashboard = React.lazy(
  () => import("./components/admin/AdminDashboard"),
);
const AdminLogin = React.lazy(() => import("./components/admin/AdminLogin"));

// Layout Components
const LoadingSpinner = React.lazy(
  () => import("./components/ui/LoadingSpinner"),
);

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center border border-orange-200">
      <div className="text-orange-500 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guest Route Component (redirects authenticated users)
const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Layout Component
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Admin Layout Component
const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-100">{children}</div>
);

// Main App Routes Component
const AppRoutes = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          }
        />

        <Route
          path="/product/:id"
          element={
            <PublicLayout>
              <Suspense fallback={<LoadingFallback />}>
                <ProductPage />
              </Suspense>
            </PublicLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <PublicLayout>
              <Suspense fallback={<LoadingFallback />}>
                <CartPage />
              </Suspense>
            </PublicLayout>
          }
        />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <PublicLayout>
                <AuthSlider />
              </PublicLayout>
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <PublicLayout>
                <AuthSlider />
              </PublicLayout>
            </GuestRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/verify-email"
          element={
            <EmailVerification />
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <CheckoutPage />
                </Suspense>
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <OrdersPage />
                </Suspense>
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <OrderDetailsPage />
                </Suspense>
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <WishlistPage />
                </Suspense>
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminLogin />
                </Suspense>
              </AdminLayout>
            </GuestRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage />
              </Suspense>
            </PublicLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Theme Effect Hook
const useThemeEffect = () => {
  useEffect(() => {
    // Set initial theme
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Handle system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        document.documentElement.setAttribute(
          "data-theme",
          e.matches ? "dark" : "light",
        );
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
};

// Analytics Effect Hook
const useAnalyticsEffect = () => {
  useEffect(() => {
    // Initialize analytics here if needed
    if (process.env.NODE_ENV === "production" && process.env.REACT_APP_GA_ID) {
      // Google Analytics initialization would go here
      console.log("Analytics initialized");
    }
  }, []);
};

// Main App Component
const App = () => {
  useThemeEffect();
  useAnalyticsEffect();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <Provider store={store}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#16a34a",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: "#dc2626",
                      secondary: "#fff",
                    },
                  },
                }}
              />

              {/* Cart Sidebar rendered globally */}
              <CartSidebar />

              {/* Main App Routes */}
              <AppRoutes />
            </div>
          </Router>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
