import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Base query with automatic token handling
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state or cookies
    const token = getState()?.auth?.token || Cookies.get('token');

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Set content type for non-FormData requests
    if (!headers.get('content-type')) {
      headers.set('content-type', 'application/json');
    }

    return headers;
  },
});

// Base query with error handling and token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 errors (token expired)
  if (result?.error && result.error.status === 401) {
    // Clear auth state and redirect to login
    api.dispatch({ type: 'auth/logout' });

    // If we're not already on the login page, redirect
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return result;
};

// Define the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Product',
    'Order',
    'Review',
    'Analytics',
    'Dashboard',
    'Admin'
  ],
  endpoints: (builder) => ({
    // ===== AUTH ENDPOINTS =====
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/users/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/users/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),

    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/users/verify-email',
        method: 'POST',
        body: { token },
      }),
    }),

    // ===== USER ENDPOINTS =====
    getUserProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/users/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // User addresses
    addAddress: builder.mutation({
      query: (addressData) => ({
        url: '/users/addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['User'],
    }),

    updateAddress: builder.mutation({
      query: ({ addressId, ...addressData }) => ({
        url: `/users/addresses/${addressId}`,
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: ['User'],
    }),

    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Wishlist
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url: `/users/wishlist/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/users/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // ===== PRODUCT ENDPOINTS =====
    getProducts: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/products${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Product'],
    }),

    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    uploadProductImages: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProductImage: builder.mutation({
      query: ({ productId, imageId }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }],
    }),

    // Product reviews
    getProductReviews: builder.query({
      query: ({ productId, ...params }) => {
        const queryString = new URLSearchParams(params).toString();
        return `/products/${productId}/reviews${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Review'],
    }),

    createProductReview: builder.mutation({
      query: ({ productId, ...reviewData }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // ===== ORDER ENDPOINTS =====
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'User'],
    }),

    getUserOrders: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/orders/myorders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Order'],
    }),

    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    updateOrderToPaid: builder.mutation({
      query: ({ id, paymentResult }) => ({
        url: `/orders/${id}/pay`,
        method: 'PUT',
        body: { paymentResult },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    createPaymentIntent: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/payment-intent`,
        method: 'POST',
      }),
    }),

    // ===== ADMIN ENDPOINTS =====
    // Users management
    getAllUsers: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Admin', 'User'],
    }),

    // Orders management
    getAllOrders: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/orders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Admin', 'Order'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, ...statusData }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: statusData,
      }),
      invalidatesTags: ['Admin', 'Order'],
    }),

    refundOrder: builder.mutation({
      query: ({ id, ...refundData }) => ({
        url: `/orders/${id}/refund`,
        method: 'POST',
        body: refundData,
      }),
      invalidatesTags: ['Admin', 'Order'],
    }),

    // Analytics
    getOrderAnalytics: builder.query({
      query: (period = '30d') => `/orders/analytics?period=${period}`,
      providesTags: ['Analytics'],
    }),

    getProductAnalytics: builder.query({
      query: (productId) => `/products/${productId}/analytics`,
      providesTags: ['Analytics'],
    }),

    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    // ===== CART ENDPOINTS =====
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation({
      query: (cartData) => ({
        url: '/cart/add',
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation({
      query: (cartData) => ({
        url: '/cart/update',
        method: 'PUT',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/cart/remove/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // ===== UTILITY ENDPOINTS =====
    healthCheck: builder.query({
      query: () => '/health',
    }),

    testEmail: builder.mutation({
      query: (email) => ({
        url: '/test-email',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,

  // User hooks
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,

  // Product hooks
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,

  // Order hooks
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderToPaidMutation,
  useCancelOrderMutation,
  useCreatePaymentIntentMutation,

  // Admin hooks
  useGetAllUsersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useRefundOrderMutation,
  useGetOrderAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useGetDashboardStatsQuery,

  // Cart hooks
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,

  // Utility hooks
  useHealthCheckQuery,
  useTestEmailMutation,
} = apiSlice;

// Export the reducer
export default apiSlice.reducer;
