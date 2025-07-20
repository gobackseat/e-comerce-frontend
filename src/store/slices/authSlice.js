import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Get initial state from localStorage/cookies
function getInitialState() {
  let user = null;
  let token = null;
  let isAuthenticated = false;
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo && userInfo !== 'undefined') {
      user = JSON.parse(userInfo);
      isAuthenticated = !!user;
    }
    token = localStorage.getItem('token');
  } catch (e) {
    user = null;
    token = null;
    isAuthenticated = false;
  }
  return {
    user,
    token,
    isAuthenticated,
    isLoading: false,
    error: null,
    loginAttempts: 0,
    lastLoginAttempt: null,
    rememberMe: false,
    verificationStatus: null,
    passwordResetStatus: null,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      const { user, token, rememberMe = false } = action.payload;

      state.isLoading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
      state.rememberMe = rememberMe;

      // Persist to storage
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('rememberMe', String(rememberMe));
      localStorage.setItem('token', token); // Save token to localStorage

      // Set cookie with appropriate expiration
      const cookieOptions = {
        expires: rememberMe ? 30 : 1, // 30 days or 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      };
      Cookies.set('token', token, cookieOptions);
    },

    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.loginAttempts += 1;
      state.lastLoginAttempt = Date.now();

      // Clear any existing auth data
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    // Registration actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    registerSuccess: (state, action) => {
      const { user, token } = action.payload;

      state.isLoading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;

      // Persist to storage
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('token', token); // Save token to localStorage
      Cookies.set('token', token, {
        expires: 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    },

    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
      state.verificationStatus = null;
      state.passwordResetStatus = null;

      // Clear storage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('rememberMe');
      Cookies.remove('token');

      // Clear other user-related data
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
    },

    // Profile update
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    // Avatar update
    updateAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear login attempts (useful for admin override)
    clearLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },

    // Email verification actions
    verificationStart: (state) => {
      state.isLoading = true;
      state.verificationStatus = null;
    },

    verificationSuccess: (state) => {
      state.isLoading = false;
      state.verificationStatus = 'success';
      if (state.user) {
        state.user.isVerified = true;
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    verificationFailure: (state, action) => {
      state.isLoading = false;
      state.verificationStatus = 'failed';
      state.error = action.payload;
    },

    // Password reset actions
    passwordResetStart: (state) => {
      state.isLoading = true;
      state.passwordResetStatus = null;
    },

    passwordResetEmailSent: (state) => {
      state.isLoading = false;
      state.passwordResetStatus = 'email_sent';
    },

    passwordResetSuccess: (state) => {
      state.isLoading = false;
      state.passwordResetStatus = 'success';
    },

    passwordResetFailure: (state, action) => {
      state.isLoading = false;
      state.passwordResetStatus = 'failed';
      state.error = action.payload;
    },

    // Clear password reset status
    clearPasswordResetStatus: (state) => {
      state.passwordResetStatus = null;
    },

    // Clear verification status
    clearVerificationStatus: (state) => {
      state.verificationStatus = null;
    },

    // Token refresh (for when token is updated)
    refreshToken: (state, action) => {
      const { token } = action.payload;
      state.token = token;

      Cookies.set('token', token, {
        expires: state.rememberMe ? 30 : 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    },

    // Update user preferences
    updatePreferences: (state, action) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    // Update addresses
    updateAddresses: (state, action) => {
      if (state.user) {
        state.user.addresses = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    // Update wishlist
    updateWishlist: (state, action) => {
      if (state.user) {
        state.user.wishlist = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    // Session timeout warning
    sessionTimeoutWarning: (state) => {
      state.error = 'Your session will expire soon. Please save your work.';
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  updateProfile,
  updateAvatar,
  clearError,
  clearLoginAttempts,
  verificationStart,
  verificationSuccess,
  verificationFailure,
  passwordResetStart,
  passwordResetEmailSent,
  passwordResetSuccess,
  passwordResetFailure,
  clearPasswordResetStatus,
  clearVerificationStatus,
  refreshToken,
  updatePreferences,
  updateAddresses,
  updateWishlist,
  sessionTimeoutWarning,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.isAdmin || false;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectVerificationStatus = (state) => state.auth.verificationStatus;
export const selectPasswordResetStatus = (state) => state.auth.passwordResetStatus;

// Helper selectors
export const selectUserFullName = (state) => {
  const user = state.auth.user;
  return user ? `${user.firstName} ${user.lastName}` : '';
};

export const selectUserInitials = (state) => {
  const user = state.auth.user;
  return user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '';
};

export const selectIsEmailVerified = (state) => state.auth.user?.isVerified || false;

export const selectCanAttemptLogin = (state) => {
  const { loginAttempts, lastLoginAttempt } = state.auth;

  // Allow up to 5 attempts
  if (loginAttempts < 5) return true;

  // If more than 5 attempts, check if 15 minutes have passed
  if (lastLoginAttempt) {
    const fifteenMinutes = 15 * 60 * 1000;
    return Date.now() - lastLoginAttempt > fifteenMinutes;
  }

  return false;
};

export const selectTimeUntilNextLoginAttempt = (state) => {
  const { loginAttempts, lastLoginAttempt } = state.auth;

  if (loginAttempts < 5 || !lastLoginAttempt) return 0;

  const fifteenMinutes = 15 * 60 * 1000;
  const timeElapsed = Date.now() - lastLoginAttempt;
  const timeRemaining = fifteenMinutes - timeElapsed;

  return Math.max(0, timeRemaining);
};

// Export the reducer
export default authSlice.reducer;
