import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../utils/Api';

const WishlistContext = createContext({
  wishlist: [],
  loading: false,
  error: null,
  fetchWishlist: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isWishlisted: () => false,
});

const getProductId = (item) => item?._id || item?.id || (typeof item === 'string' ? item : undefined);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const fetchWishlistItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchWishlist(token);
      setWishlist(items);
    } catch (err) {
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchWishlistItems();
  }, [token, fetchWishlistItems]);

  const addToWishlist = async (product) => {
    setLoading(true);
    setError(null);
    try {
      const productId = getProductId(product);
      // Optimistic: add full product if available, else just id
      setWishlist((prev) => [...prev, typeof product === 'object' ? product : { _id: productId }]);
      await apiAddToWishlist(productId, token);
      await fetchWishlistItems();
    } catch (err) {
      setError(err.message || 'Failed to add to wishlist');
      setWishlist((prev) => prev.filter((item) => getProductId(item) !== getProductId(product)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (product) => {
    setLoading(true);
    setError(null);
    try {
      const productId = getProductId(product);
      setWishlist((prev) => prev.filter((item) => getProductId(item) !== productId));
      await apiRemoveFromWishlist(productId, token);
      await fetchWishlistItems();
    } catch (err) {
      setError(err.message || 'Failed to remove from wishlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = (product) => {
    const productId = getProductId(product);
    return Array.isArray(wishlist) && wishlist.some((item) => getProductId(item) === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      error,
      fetchWishlist: fetchWishlistItems,
      addToWishlist,
      removeFromWishlist,
      isWishlisted,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext); 