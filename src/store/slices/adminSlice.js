import { createSlice } from '@reduxjs/toolkit';

// Initial state for admin dashboard
const initialState = {
  // Dashboard data
  stats: {
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    ordersToday: 0,
    revenueToday: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    lastUpdated: null,
  },

  // Recent activity
  recentOrders: [],
  recentUsers: [],
  recentReviews: [],
  lowStockProducts: [],

  // Analytics data
  analytics: {
    salesChart: [],
    userGrowthChart: [],
    topProducts: [],
    topCategories: [],
    orderStatusBreakdown: [],
    revenueByMonth: [],
    trafficSources: [],
    conversionFunnel: [],
  },

  // Filters and settings
  dateRange: {
    start: null,
    end: null,
    preset: '30d', // 7d, 30d, 90d, 1y, custom
  },

  // UI state
  sidebarCollapsed: localStorage.getItem('adminSidebarCollapsed') === 'true',
  activeSection: 'dashboard',
  selectedOrders: [],
  selectedUsers: [],
  bulkActionMode: false,

  // Modal states
  modals: {
    addProduct: false,
    editProduct: false,
    addUser: false,
    editUser: false,
    orderDetails: false,
    userDetails: false,
    productDetails: false,
    bulkActions: false,
    settings: false,
    exportData: false,
  },

  // Loading states
  loading: {
    dashboard: false,
    orders: false,
    users: false,
    products: false,
    analytics: false,
    export: false,
    bulkActions: false,
  },

  // Error states
  errors: {
    dashboard: null,
    orders: null,
    users: null,
    products: null,
    analytics: null,
    general: null,
  },

  // Pagination
  pagination: {
    orders: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    users: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    products: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    reviews: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },

  // Search and filters
  search: {
    orders: '',
    users: '',
    products: '',
    reviews: '',
  },

  filters: {
    orders: {
      status: 'all',
      dateRange: null,
      minAmount: null,
      maxAmount: null,
    },
    users: {
      status: 'all',
      dateRange: null,
      verified: 'all',
    },
    products: {
      status: 'all',
      category: 'all',
      stock: 'all',
    },
    reviews: {
      rating: 'all',
      status: 'all',
      verified: 'all',
    },
  },

  // Notifications
  notifications: [],
  unreadNotifications: 0,

  // System settings
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },

  // Performance metrics
  performance: {
    pageLoadTime: 0,
    apiResponseTime: 0,
    databaseQueryTime: 0,
    uptime: 100,
    errorRate: 0,
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Dashboard stats actions
    setDashboardStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload,
        lastUpdated: Date.now(),
      };
      state.loading.dashboard = false;
      state.errors.dashboard = null;
    },

    setDashboardLoading: (state, action) => {
      state.loading.dashboard = action.payload;
    },

    setDashboardError: (state, action) => {
      state.errors.dashboard = action.payload;
      state.loading.dashboard = false;
    },

    // Recent activity actions
    setRecentOrders: (state, action) => {
      state.recentOrders = action.payload;
    },

    setRecentUsers: (state, action) => {
      state.recentUsers = action.payload;
    },

    setRecentReviews: (state, action) => {
      state.recentReviews = action.payload;
    },

    setLowStockProducts: (state, action) => {
      state.lowStockProducts = action.payload;
    },

    // Analytics actions
    setAnalyticsData: (state, action) => {
      state.analytics = {
        ...state.analytics,
        ...action.payload,
      };
      state.loading.analytics = false;
      state.errors.analytics = null;
    },

    setAnalyticsLoading: (state, action) => {
      state.loading.analytics = action.payload;
    },

    setAnalyticsError: (state, action) => {
      state.errors.analytics = action.payload;
      state.loading.analytics = false;
    },

    // Date range actions
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },

    setDatePreset: (state, action) => {
      const preset = action.payload;
      const now = new Date();
      let start;

      switch (preset) {
        case '7d':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      state.dateRange = {
        start: start.toISOString(),
        end: now.toISOString(),
        preset,
      };
    },

    // UI state actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('adminSidebarCollapsed', String(state.sidebarCollapsed));
    },

    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('adminSidebarCollapsed', String(action.payload));
    },

    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },

    // Modal actions
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },

    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Loading actions
    setLoading: (state, action) => {
      const { section, loading } = action.payload;
      if (state.loading.hasOwnProperty(section)) {
        state.loading[section] = loading;
      }
    },

    // Error actions
    setError: (state, action) => {
      const { section, error } = action.payload;
      if (state.errors.hasOwnProperty(section)) {
        state.errors[section] = error;
        if (state.loading.hasOwnProperty(section)) {
          state.loading[section] = false;
        }
      }
    },

    clearError: (state, action) => {
      const section = action.payload;
      if (state.errors.hasOwnProperty(section)) {
        state.errors[section] = null;
      }
    },

    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
    },

    // Pagination actions
    setPagination: (state, action) => {
      const { section, pagination } = action.payload;
      if (state.pagination.hasOwnProperty(section)) {
        state.pagination[section] = {
          ...state.pagination[section],
          ...pagination,
        };
      }
    },

    // Search actions
    setSearch: (state, action) => {
      const { section, query } = action.payload;
      if (state.search.hasOwnProperty(section)) {
        state.search[section] = query;
        // Reset pagination when searching
        if (state.pagination.hasOwnProperty(section)) {
          state.pagination[section].page = 1;
        }
      }
    },

    // Filter actions
    setFilter: (state, action) => {
      const { section, filterName, value } = action.payload;
      if (state.filters.hasOwnProperty(section)) {
        state.filters[section][filterName] = value;
        // Reset pagination when filtering
        if (state.pagination.hasOwnProperty(section)) {
          state.pagination[section].page = 1;
        }
      }
    },

    setFilters: (state, action) => {
      const { section, filters } = action.payload;
      if (state.filters.hasOwnProperty(section)) {
        state.filters[section] = {
          ...state.filters[section],
          ...filters,
        };
        // Reset pagination when filtering
        if (state.pagination.hasOwnProperty(section)) {
          state.pagination[section].page = 1;
        }
      }
    },

    resetFilters: (state, action) => {
      const section = action.payload;
      if (state.filters.hasOwnProperty(section)) {
        // Reset to initial values based on section
        switch (section) {
          case 'orders':
            state.filters.orders = {
              status: 'all',
              dateRange: null,
              minAmount: null,
              maxAmount: null,
            };
            break;
          case 'users':
            state.filters.users = {
              status: 'all',
              dateRange: null,
              verified: 'all',
            };
            break;
          case 'products':
            state.filters.products = {
              status: 'all',
              category: 'all',
              stock: 'all',
            };
            break;
          case 'reviews':
            state.filters.reviews = {
              rating: 'all',
              status: 'all',
              verified: 'all',
            };
            break;
        }
        // Reset pagination
        if (state.pagination.hasOwnProperty(section)) {
          state.pagination[section].page = 1;
        }
      }
    },

    // Selection actions
    setSelectedOrders: (state, action) => {
      state.selectedOrders = action.payload;
    },

    toggleOrderSelection: (state, action) => {
      const orderId = action.payload;
      const index = state.selectedOrders.indexOf(orderId);
      if (index > -1) {
        state.selectedOrders.splice(index, 1);
      } else {
        state.selectedOrders.push(orderId);
      }
    },

    selectAllOrders: (state, action) => {
      state.selectedOrders = action.payload;
    },

    clearOrderSelection: (state) => {
      state.selectedOrders = [];
    },

    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },

    toggleUserSelection: (state, action) => {
      const userId = action.payload;
      const index = state.selectedUsers.indexOf(userId);
      if (index > -1) {
        state.selectedUsers.splice(index, 1);
      } else {
        state.selectedUsers.push(userId);
      }
    },

    selectAllUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },

    clearUserSelection: (state) => {
      state.selectedUsers = [];
    },

    // Bulk action mode
    setBulkActionMode: (state, action) => {
      state.bulkActionMode = action.payload;
      if (!action.payload) {
        state.selectedOrders = [];
        state.selectedUsers = [];
      }
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },

    markNotificationRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
      }
    },

    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadNotifications = 0;
    },

    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const index = state.notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },

    // Settings actions
    updateSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },

    resetSettings: (state) => {
      state.settings = initialState.settings;
    },

    // Performance metrics
    updatePerformance: (state, action) => {
      state.performance = {
        ...state.performance,
        ...action.payload,
      };
    },

    // Reset admin state
    resetAdminState: (state) => {
      return {
        ...initialState,
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      };
    },
  },
});

// Export actions
export const {
  setDashboardStats,
  setDashboardLoading,
  setDashboardError,
  setRecentOrders,
  setRecentUsers,
  setRecentReviews,
  setLowStockProducts,
  setAnalyticsData,
  setAnalyticsLoading,
  setAnalyticsError,
  setDateRange,
  setDatePreset,
  toggleSidebar,
  setSidebarCollapsed,
  setActiveSection,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setError,
  clearError,
  clearAllErrors,
  setPagination,
  setSearch,
  setFilter,
  setFilters,
  resetFilters,
  setSelectedOrders,
  toggleOrderSelection,
  selectAllOrders,
  clearOrderSelection,
  setSelectedUsers,
  toggleUserSelection,
  selectAllUsers,
  clearUserSelection,
  setBulkActionMode,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  updateSettings,
  resetSettings,
  updatePerformance,
  resetAdminState,
} = adminSlice.actions;

// Selectors
export const selectAdmin = (state) => state.admin;
export const selectDashboardStats = (state) => state.admin.stats;
export const selectRecentOrders = (state) => state.admin.recentOrders;
export const selectRecentUsers = (state) => state.admin.recentUsers;
export const selectAnalytics = (state) => state.admin.analytics;
export const selectDateRange = (state) => state.admin.dateRange;
export const selectSidebarCollapsed = (state) => state.admin.sidebarCollapsed;
export const selectActiveSection = (state) => state.admin.activeSection;
export const selectModals = (state) => state.admin.modals;
export const selectLoading = (state) => state.admin.loading;
export const selectErrors = (state) => state.admin.errors;
export const selectPagination = (state) => state.admin.pagination;
export const selectSearch = (state) => state.admin.search;
export const selectFilters = (state) => state.admin.filters;
export const selectSelectedOrders = (state) => state.admin.selectedOrders;
export const selectSelectedUsers = (state) => state.admin.selectedUsers;
export const selectBulkActionMode = (state) => state.admin.bulkActionMode;
export const selectNotifications = (state) => state.admin.notifications;
export const selectUnreadNotifications = (state) => state.admin.unreadNotifications;
export const selectSettings = (state) => state.admin.settings;
export const selectPerformance = (state) => state.admin.performance;

// Complex selectors
export const selectIsModalOpen = (modalName) => (state) =>
  state.admin.modals[modalName] || false;

export const selectIsLoading = (section) => (state) =>
  state.admin.loading[section] || false;

export const selectError = (section) => (state) =>
  state.admin.errors[section];

export const selectPaginationForSection = (section) => (state) =>
  state.admin.pagination[section];

export const selectSearchForSection = (section) => (state) =>
  state.admin.search[section];

export const selectFiltersForSection = (section) => (state) =>
  state.admin.filters[section];

export const selectHasActiveFilters = (section) => (state) => {
  const filters = state.admin.filters[section];
  if (!filters) return false;

  return Object.values(filters).some(value =>
    value !== 'all' && value !== null && value !== '' && value !== undefined
  );
};

export const selectOrderSelectionCount = (state) => state.admin.selectedOrders.length;
export const selectUserSelectionCount = (state) => state.admin.selectedUsers.length;

export const selectRecentNotifications = (state) =>
  state.admin.notifications.slice(0, 5);

export const selectUnreadNotificationCount = (state) => state.admin.unreadNotifications;

export const selectDashboardLoading = (state) => state.admin.loading.dashboard;
export const selectDashboardError = (state) => state.admin.errors.dashboard;

// Export the reducer
export default adminSlice.reducer;
