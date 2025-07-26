import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItem as apiUpdateCartItem, checkAuth } from '../utils/Api';

const GUEST_CART_KEY = 'guest_cart';

const CartContext = createContext({
  cart: [],
  isCartOpen: false,
  setIsCartOpen: () => {},
  loading: false,
  error: null,
  fetchCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('E_COMMERCE_TOKEN');

  // Helper: guest cart localStorage
  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
    } catch {
      return [];
    }
  };
  const setGuestCart = (items) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  };
  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
  };

  // Fetch cart from backend or localStorage
  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        console.log('Fetching cart with token:', token ? token.substring(0, 20) + '...' : 'No token');
        const items = await fetchCart(token);
        console.log('Cart items received:', items);
        setCart(items);
      } else {
        console.log('No token, using guest cart');
        setCart(getGuestCart());
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      // If it's an authentication error, clear the token and use guest cart
      if (err.status === 401 || err.message?.includes('unauthorized')) {
        console.log('Authentication failed, clearing token and using guest cart');
        localStorage.removeItem('E_COMMERCE_TOKEN');
        setCart(getGuestCart());
      } else {
        setError(err.message || 'Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // On mount or token change, fetch cart
  useEffect(() => {
    const verifyAndFetchCart = async () => {
      if (token) {
        try {
          // First verify the token is valid
          await checkAuth(token);
          // If valid, fetch cart
          await fetchCartItems();
        } catch (err) {
          console.error('Token verification failed:', err);
          // Clear invalid token
          localStorage.removeItem('E_COMMERCE_TOKEN');
          setCart(getGuestCart());
        }
      } else {
        fetchCartItems();
      }
    };
    
    verifyAndFetchCart();
  }, [token, fetchCartItems]);

  // On login, merge guest cart with backend
  useEffect(() => {
    if (token) {
      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        // Merge each guest cart item into backend
        Promise.all(
          guestCart.map((item) =>
            apiAddToCart({ productId: item.productId || item.id, count: item.count || 1 }, token)
          )
        ).then(() => {
          clearGuestCart();
          fetchCartItems();
        });
      }
    }
    // eslint-disable-next-line
  }, [token]);

  // Add to cart (backend or guest)
  const addToCart = async (item) => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        await apiAddToCart({ productId: item.productId || item.id, count: item.count || 1 }, token);
        await fetchCartItems();
      } else {
        // Guest cart logic
        const guestCart = getGuestCart();
        const idx = guestCart.findIndex((i) => i.id === item.id);
        if (idx > -1) {
          guestCart[idx].count = (guestCart[idx].count || 1) + (item.count || 1);
        } else {
          guestCart.push({ ...item, count: item.count || 1 });
        }
        setGuestCart(guestCart);
        setCart(guestCart);
      }
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart (backend or guest)
  const removeFromCart = async (cartId) => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        await apiRemoveFromCart(cartId, token);
        await fetchCartItems();
      } else {
        const guestCart = getGuestCart().filter((item) => item.id !== cartId && item.productId !== cartId);
        setGuestCart(guestCart);
        setCart(guestCart);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item (backend or guest)
  const updateCartItem = async (productId, count) => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        await apiUpdateCartItem({ productId, count }, token);
        await fetchCartItems();
      } else {
        const guestCart = getGuestCart().map((item) =>
          (item.productId === productId || item.id === productId) ? { ...item, count } : item
        );
        setGuestCart(guestCart);
        setCart(guestCart);
      }
    } catch (err) {
      setError(err.message || 'Failed to update cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart (backend or guest)
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        // Remove all items one by one
        await Promise.all(cart.map(item => apiRemoveFromCart(item._id, token)));
        await fetchCartItems();
      } else {
        clearGuestCart();
        setCart([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () =>
    Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.count || 1), 0) : 0;

  const getTotalPrice = () =>
    Array.isArray(cart)
      ? cart.reduce(
          (sum, item) =>
            sum + ((item.productId?.price || item.price || 0) * (item.count || 1)),
          0
        )
      : 0;

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      loading,
      error,
      fetchCart: fetchCartItems,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      getTotalItems,
      getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 