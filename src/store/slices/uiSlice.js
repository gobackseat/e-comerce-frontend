import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Theme and appearance
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: false,
  mobileMenuOpen: false,

  // Loading states
  globalLoading: false,
  loadingText: '',

  // Notifications and toasts
  notifications: [],
  toasts: [],

  // Modals and dialogs
  modals: {
    productPreview: { isOpen: false, productId: null },
    cartDrawer: { isOpen: false },
    authModal: { isOpen: false, mode: 'login' }, // login, register, forgot
    confirmDialog: { isOpen: false, title: '', message: '', onConfirm: null },
    imageGallery: { isOpen: false, images: [], currentIndex: 0 },
    newsletter: { isOpen: false },
    support: { isOpen: false },
  },

  // Search and filters
  searchQuery: '',
  searchSuggestions: [],
  showSearchSuggestions: false,
  filters: {
    category: '',
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
  },

  // Layout and navigation
  currentPage: '',
  breadcrumbs: [],
  scrollPosition: 0,

  // Animation states
  pageTransition: false,
  animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Admin dashboard specific
  adminSidebar: {
    collapsed: localStorage.getItem('adminSidebarCollapsed') === 'true',
    activeMenu: 'dashboard',
  },

  // Product display preferences
  viewMode: localStorage.getItem('viewMode') || 'grid', // grid, list
  sortBy: 'featured',

  // Shopping experience
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),

  // Error handling
  errors: [],
  connectionStatus: 'online',

  // Performance and accessibility
  highContrast: localStorage.getItem('highContrast') === 'true',
  fontSize: localStorage.getItem('fontSize') || 'normal', // small, normal, large

  // Feature flags
  features: {
    newProductBadge: true,
    reviewSystem: true,
    wishlist: true,
    compareProducts: false,
    liveChat: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },

    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },

    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },

    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload.loading;
      state.loadingText = action.payload.text || '';
    },

    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },

    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Toast actions
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        duration: 5000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },

    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },

    // Modal actions
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...state.modals[modalName], isOpen: true, ...data };
      }
    },

    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName].isOpen = false;
      }
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName].isOpen = false;
      });
    },

    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setSearchSuggestions: (state, action) => {
      state.searchSuggestions = action.payload;
    },

    setShowSearchSuggestions: (state, action) => {
      state.showSearchSuggestions = action.payload;
    },

    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchSuggestions = [];
      state.showSearchSuggestions = false;
    },

    // Filter actions
    setFilter: (state, action) => {
      const { filterName, value } = action.payload;
      state.filters[filterName] = value;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = {
        category: '',
        priceRange: [0, 1000],
        rating: 0,
        inStock: false,
      };
    },

    // Navigation actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },

    setScrollPosition: (state, action) => {
      state.scrollPosition = action.payload;
    },

    // Animation actions
    setPageTransition: (state, action) => {
      state.pageTransition = action.payload;
    },

    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
      localStorage.setItem('animationsEnabled', String(state.animationsEnabled));
    },

    setAnimationsEnabled: (state, action) => {
      state.animationsEnabled = action.payload;
      localStorage.setItem('animationsEnabled', String(action.payload));
    },

    // Admin dashboard actions
    toggleAdminSidebar: (state) => {
      state.adminSidebar.collapsed = !state.adminSidebar.collapsed;
      localStorage.setItem('adminSidebarCollapsed', String(state.adminSidebar.collapsed));
    },

    setAdminActiveMenu: (state, action) => {
      state.adminSidebar.activeMenu = action.payload;
    },

    // View mode actions
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      localStorage.setItem('viewMode', action.payload);
    },

    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },

    // Recently viewed actions
    addRecentlyViewed: (state, action) => {
      const productId = action.payload;

      // Remove if already exists
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== productId);

      // Add to beginning
      state.recentlyViewed.unshift(productId);

      // Keep only last 10 items
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }

      localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed));
    },

    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
      localStorage.removeItem('recentlyViewed');
    },

    // Error handling actions
    addError: (state, action) => {
      const error = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.errors.push(error);
    },

    removeError: (state, action) => {
      state.errors = state.errors.filter(e => e.id !== action.payload);
    },

    clearErrors: (state) => {
      state.errors = [];
    },

    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    // Accessibility actions
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
      localStorage.setItem('highContrast', String(state.highContrast));
    },

    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
    },

    // Feature flag actions
    toggleFeature: (state, action) => {
      const featureName = action.payload;
      if (state.features.hasOwnProperty(featureName)) {
        state.features[featureName] = !state.features[featureName];
      }
    },

    setFeature: (state, action) => {
      const { featureName, enabled } = action.payload;
      if (state.features.hasOwnProperty(featureName)) {
        state.features[featureName] = enabled;
      }
    },

    // Reset all UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        animationsEnabled: state.animationsEnabled,
        adminSidebar: state.adminSidebar,
        viewMode: state.viewMode,
        recentlyViewed: state.recentlyViewed,
        highContrast: state.highContrast,
        fontSize: state.fontSize,
      };
    },
  },
});

// Export actions
export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setGlobalLoading,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  closeAllModals,
  setSearchQuery,
  setSearchSuggestions,
  setShowSearchSuggestions,
  clearSearch,
  setFilter,
  setFilters,
  resetFilters,
  setCurrentPage,
  setBreadcrumbs,
  setScrollPosition,
  setPageTransition,
  toggleAnimations,
  setAnimationsEnabled,
  toggleAdminSidebar,
  setAdminActiveMenu,
  setViewMode,
  setSortBy,
  addRecentlyViewed,
  clearRecentlyViewed,
  addError,
  removeError,
  clearErrors,
  setConnectionStatus,
  toggleHighContrast,
  setFontSize,
  toggleFeature,
  setFeature,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectUI = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectLoadingText = (state) => state.ui.loadingText;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) =>
  state.ui.notifications.filter(n => !n.read);
export const selectToasts = (state) => state.ui.toasts;
export const selectModals = (state) => state.ui.modals;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectSearchSuggestions = (state) => state.ui.searchSuggestions;
export const selectShowSearchSuggestions = (state) => state.ui.showSearchSuggestions;
export const selectFilters = (state) => state.ui.filters;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectScrollPosition = (state) => state.ui.scrollPosition;
export const selectPageTransition = (state) => state.ui.pageTransition;
export const selectAnimationsEnabled = (state) => state.ui.animationsEnabled;
export const selectReducedMotion = (state) => state.ui.reducedMotion;
export const selectAdminSidebar = (state) => state.ui.adminSidebar;
export const selectViewMode = (state) => state.ui.viewMode;
export const selectSortBy = (state) => state.ui.sortBy;
export const selectRecentlyViewed = (state) => state.ui.recentlyViewed;
export const selectErrors = (state) => state.ui.errors;
export const selectConnectionStatus = (state) => state.ui.connectionStatus;
export const selectHighContrast = (state) => state.ui.highContrast;
export const selectFontSize = (state) => state.ui.fontSize;
export const selectFeatures = (state) => state.ui.features;

// Complex selectors
export const selectIsModalOpen = (modalName) => (state) =>
  state.ui.modals[modalName]?.isOpen || false;

export const selectModalData = (modalName) => (state) =>
  state.ui.modals[modalName] || {};

export const selectHasActiveFilters = (state) => {
  const filters = state.ui.filters;
  return (
    filters.category !== '' ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 1000 ||
    filters.rating !== 0 ||
    filters.inStock
  );
};

export const selectIsFeatureEnabled = (featureName) => (state) =>
  state.ui.features[featureName] || false;

export const selectShouldReduceMotion = (state) =>
  state.ui.reducedMotion || !state.ui.animationsEnabled;

// Export the reducer
export default uiSlice.reducer;
