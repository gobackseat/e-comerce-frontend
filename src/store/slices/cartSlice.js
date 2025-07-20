import { createSlice } from '@reduxjs/toolkit';

// Helper function to calculate totals
const calculateTotals = (items) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shippingThreshold = 75;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 9.99;
  const total = subtotal + tax + shippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: shippingCost,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
  };
};

// Get initial cart state from localStorage
const getInitialState = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
    const totals = calculateTotals(cartItems);

    return {
      items: cartItems,
      isOpen: false,
      isLoading: false,
      error: null,
      ...totals,
      shippingInfo: null,
      appliedCoupon: null,
      discount: 0,
      lastUpdated: null,
    };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return {
      items: [],
      isOpen: false,
      isLoading: false,
      error: null,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
      shippingInfo: null,
      appliedCoupon: null,
      discount: 0,
      lastUpdated: null,
    };
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialState(),
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { product, variant, quantity = 1 } = action.payload;

      // Create unique item ID based on product and variant
      const itemId = variant ? `${product._id}-${variant.id}` : product._id;

      // Check if item already exists
      const existingItem = state.items.find(item => item.itemId === itemId);

      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item
        const newItem = {
          itemId,
          productId: product._id,
          name: product.name,
          price: variant ? variant.price : product.basePrice,
          image: product.mainImage?.url || product.images?.[0]?.url || '',
          variant: variant ? {
            id: variant.id,
            name: variant.name,
            color: variant.color,
            size: variant.size,
          } : null,
          quantity,
          maxStock: variant ? variant.countInStock : product.totalStock,
          sku: variant ? variant.sku : product.sku || product._id,
          addedAt: Date.now(),
        };

        state.items.push(newItem);
      }

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      state.lastUpdated = Date.now();
      state.error = null;

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.itemId !== itemId);

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      state.lastUpdated = Date.now();

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    // Update item quantity
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;

      if (quantity <= 0) {
        state.items = state.items.filter(item => item.itemId !== itemId);
      } else {
        const item = state.items.find(item => item.itemId === itemId);
        if (item) {
          // Check against max stock
          item.quantity = Math.min(quantity, item.maxStock);
        }
      }

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      state.lastUpdated = Date.now();

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    // Increment item quantity
    incrementQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.itemId === itemId);

      if (item && item.quantity < item.maxStock) {
        item.quantity += 1;

        // Recalculate totals
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.lastUpdated = Date.now();

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },

    // Decrement item quantity
    decrementQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.itemId === itemId);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter(item => item.itemId !== itemId);
        }

        // Recalculate totals
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.lastUpdated = Date.now();

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.shipping = 0;
      state.total = 0;
      state.itemCount = 0;
      state.appliedCoupon = null;
      state.discount = 0;
      state.lastUpdated = Date.now();

      // Clear localStorage
      localStorage.removeItem('cart');
    },

    // Toggle cart drawer
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    // Open cart drawer
    openCart: (state) => {
      state.isOpen = true;
    },

    // Close cart drawer
    closeCart: (state) => {
      state.isOpen = false;
    },

    // Set loading state
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setCartError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearCartError: (state) => {
      state.error = null;
    },

    // Apply coupon
    applyCoupon: (state, action) => {
      const { code, discount } = action.payload;
      state.appliedCoupon = code;
      state.discount = discount;

      // Recalculate total with discount
      const baseTotal = state.subtotal + state.tax + state.shipping;
      state.total = Math.max(0, baseTotal - discount);
      state.total = Math.round(state.total * 100) / 100;
    },

    // Remove coupon
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;

      // Recalculate total without discount
      state.total = state.subtotal + state.tax + state.shipping;
      state.total = Math.round(state.total * 100) / 100;
    },

    // Set shipping info
    setShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },

    // Sync cart from server (for authenticated users)
    syncCart: (state, action) => {
      const serverCart = action.payload;
      if (serverCart && Array.isArray(serverCart.items)) {
        state.items = serverCart.items;

        // Recalculate totals
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.lastUpdated = Date.now();

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },

    // Merge local cart with server cart
    mergeCart: (state, action) => {
      const serverItems = action.payload?.items || [];
      const localItems = state.items;

      // Create a map of server items for quick lookup
      const serverItemsMap = new Map();
      serverItems.forEach(item => {
        serverItemsMap.set(item.itemId, item);
      });

      // Merge logic: local items take precedence, add unique server items
      const mergedItems = [...localItems];

      serverItems.forEach(serverItem => {
        const existingLocal = mergedItems.find(item => item.itemId === serverItem.itemId);
        if (!existingLocal) {
          mergedItems.push(serverItem);
        }
      });

      state.items = mergedItems;

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      state.lastUpdated = Date.now();

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    // Update item stock info (when product stock changes)
    updateItemStock: (state, action) => {
      const { productId, variantId, newStock } = action.payload;

      const item = state.items.find(item => {
        if (variantId) {
          return item.productId === productId && item.variant?.id === variantId;
        }
        return item.productId === productId && !item.variant;
      });

      if (item) {
        item.maxStock = newStock;

        // Adjust quantity if it exceeds new stock
        if (item.quantity > newStock) {
          item.quantity = Math.max(0, newStock);

          // Remove item if no stock
          if (item.quantity === 0) {
            state.items = state.items.filter(i => i.itemId !== item.itemId);
          }

          // Recalculate totals
          const totals = calculateTotals(state.items);
          Object.assign(state, totals);

          state.lastUpdated = Date.now();

          // Save to localStorage
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      }
    },

    // Validate cart items (check stock, prices, etc.)
    validateCart: (state, action) => {
      const validationData = action.payload; // Array of product validation data
      let hasChanges = false;

      state.items = state.items.filter(item => {
        const validationInfo = validationData.find(v => v.productId === item.productId);

        if (!validationInfo) {
          // Product no longer exists
          hasChanges = true;
          return false;
        }

        // Update price if changed
        const newPrice = item.variant
          ? validationInfo.variants?.find(v => v.id === item.variant.id)?.price
          : validationInfo.basePrice;

        if (newPrice && newPrice !== item.price) {
          item.price = newPrice;
          hasChanges = true;
        }

        // Update stock if changed
        const newStock = item.variant
          ? validationInfo.variants?.find(v => v.id === item.variant.id)?.countInStock
          : validationInfo.totalStock;

        if (newStock !== undefined && newStock !== item.maxStock) {
          item.maxStock = newStock;

          // Adjust quantity if needed
          if (item.quantity > newStock) {
            item.quantity = Math.max(0, newStock);
            hasChanges = true;
          }

          // Remove if no stock
          if (newStock === 0) {
            hasChanges = true;
            return false;
          }
        }

        return true;
      });

      if (hasChanges) {
        // Recalculate totals
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        state.lastUpdated = Date.now();

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  setCartLoading,
  setCartError,
  clearCartError,
  applyCoupon,
  removeCoupon,
  setShippingInfo,
  syncCart,
  mergeCart,
  updateItemStock,
  validateCart,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartTax = (state) => state.cart.tax;
export const selectCartShipping = (state) => state.cart.shipping;
export const selectCartDiscount = (state) => state.cart.discount;
export const selectIsCartOpen = (state) => state.cart.isOpen;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;
export const selectShippingInfo = (state) => state.cart.shippingInfo;

// Complex selectors
export const selectCartItemById = (itemId) => (state) =>
  state.cart.items.find(item => item.itemId === itemId);

export const selectCartItemsByProduct = (productId) => (state) =>
  state.cart.items.filter(item => item.productId === productId);

export const selectCartSummary = (state) => ({
  itemCount: state.cart.itemCount,
  subtotal: state.cart.subtotal,
  tax: state.cart.tax,
  shipping: state.cart.shipping,
  discount: state.cart.discount,
  total: state.cart.total,
  appliedCoupon: state.cart.appliedCoupon,
});

export const selectIsProductInCart = (productId, variantId = null) => (state) => {
  const itemId = variantId ? `${productId}-${variantId}` : productId;
  return state.cart.items.some(item => item.itemId === itemId);
};

export const selectProductQuantityInCart = (productId, variantId = null) => (state) => {
  const itemId = variantId ? `${productId}-${variantId}` : productId;
  const item = state.cart.items.find(item => item.itemId === itemId);
  return item ? item.quantity : 0;
};

export const selectIsCartEmpty = (state) => state.cart.items.length === 0;

export const selectCartNeedsUpdate = (state) => {
  const now = Date.now();
  const lastUpdated = state.cart.lastUpdated;
  const fiveMinutes = 5 * 60 * 1000;

  return lastUpdated && (now - lastUpdated) > fiveMinutes;
};

export const selectEligibleForFreeShipping = (state) => {
  const threshold = 75; // Free shipping threshold
  return state.cart.subtotal >= threshold;
};

export const selectAmountForFreeShipping = (state) => {
  const threshold = 75;
  const remaining = threshold - state.cart.subtotal;
  return remaining > 0 ? remaining : 0;
};

// Export the reducer
export default cartSlice.reducer;
