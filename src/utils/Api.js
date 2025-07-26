import { config } from "./config";
import { getToken } from "./localstorage";
import axios from 'axios';

const getRequest = async (path) => {
  try {
    const params = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    };
    const res = await fetch(config.baseURL + path, params);
    const data = await res.text();
    return { statusCode: res.status, data };
  } catch (e) {
    return { statusCode: 400, data: [] };
  }
};

const postRequest = async (path, body) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (!['/users/signup', '/users/signin'].includes(path) && getToken()) {
      headers.Authorization = "Bearer " + getToken();
    }
    const params = {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    };
    const res = await fetch(config.baseURL + path, params);
    const data = await res.text();
    return { statusCode: res.status, data };
  } catch (e) {
    console.log(`error in post Request (${path}) :- `, e);
  }
};

const DeleteRequest = async (path) => {
  try {
    const params = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
    };
    const res = await fetch(config.baseURL + path, params);
    const data = await res.text();
    return { statusCode: res.status, data };
  } catch (e) {
    console.log(`error in Delete Request (${path}) :- `, e);
  }
};

const putRequest = async (path, body) => {
  try {
    const params = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify(body),
    };
    const res = await fetch(config.baseURL + path, params);
    const data = await res.text();
    return { statusCode: res.status, data };
  } catch (e) {
    console.log(`error in PUT Request (${path}) :- `, e);
  }
};

// All axios-based functions should use config.baseURL
export async function fetchCart(token) {
  try {
    console.log('Fetching cart with token:', token ? token.substring(0, 20) + '...' : 'No token');
    const res = await axios.get(`${config.baseURL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    console.log('Cart response:', res.data);
    return res.data.carts || [];
  } catch (err) {
    console.error('Cart fetch error:', err.response?.data || err);
    // Check if response is not JSON
    if (err.response?.data && typeof err.response.data === 'string' && err.response.data.startsWith('PK')) {
      console.error('Received binary data instead of JSON');
      throw new Error('Server returned invalid response format');
    }
    throw err.response?.data || err;
  }
}

export async function addToCart(item, token) {
  try {
    console.log('Adding to cart with token:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('Adding item:', item);
    const res = await axios.post(
      `${config.baseURL}/cart`,
      { productId: item.productId || item.id, count: item.count || 1 },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    console.log('Add to cart response:', res.data);
    return res.data.cart || res.data;
  } catch (err) {
    console.error('Add to cart error:', err.response?.data || err);
    throw err.response?.data || err;
  }
}

export async function removeFromCart(cartId, token) {
  try {
    await axios.delete(`${config.baseURL}/cart/${cartId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function updateCartItem({ productId, count }, token) {
  try {
    const res = await axios.put(
      `${config.baseURL}/cart`,
      { productId, count },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return res.data.cart || res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function createOrder(orderData, token) {
  try {
    const res = await axios.post(`${config.baseURL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}



export async function fetchWishlist(token) {
  try {
    const res = await axios.get(`${config.baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function addToWishlist(productId, token) {
  try {
    await axios.post(`${config.baseURL}/users/wishlist/${productId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function removeFromWishlist(productId, token) {
  try {
    await axios.delete(`${config.baseURL}/users/wishlist/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function createCheckoutSession(checkoutData, token) {
  try {
    const res = await axios.post(
      `${config.baseURL}/checkout/create-session`,
      checkoutData,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function createGuestCheckoutSession(checkoutData) {
  try {
    const res = await axios.post(
      `${config.baseURL}/checkout/create-guest-session`,
      checkoutData,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}



export async function verifyPayment(sessionId, token, paymentIntentData) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    if (paymentIntentData && paymentIntentData.orderId) {
      // New payment intent flow - get order by ID
      const res = await axios.get(
        `${config.baseURL}/orders/${paymentIntentData.orderId}`,
        { headers, withCredentials: true }
      );
      return { success: true, order: res.data };
    } else if (sessionId) {
      // Legacy session flow
      const res = await axios.get(
        `${config.baseURL}/checkout/verify/${sessionId}`,
        { headers, withCredentials: true }
      );
      return res.data;
    } else {
      throw new Error('No valid payment information provided');
    }
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getCheckoutStatus(sessionId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(
      `${config.baseURL}/checkout/status/${sessionId}`,
      { headers, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function checkAuth(token) {
  try {
    const res = await axios.get(`${config.baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function fetchMyOrders(token) {
  try {
    const res = await axios.get(`${config.baseURL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export const Api = {
  getRequest: async (url, configArg = {}) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { ...configArg.headers, Authorization: `Bearer ${token}` } : configArg.headers;
      // Prepend config.baseURL if not already present
      const fullUrl = url.startsWith('http') ? url : config.baseURL + url;
      const response = await axios.get(fullUrl, { ...configArg, headers });
      return { statusCode: response.status, data: response.data };
    } catch (error) {
      return { statusCode: error.response?.status || 500, data: error.response?.data || {} };
    }
  },
  postRequest,
  DeleteRequest,
  putRequest,
};

// Create payment intent for direct frontend payment
export async function createPaymentIntent(paymentData) {
  try {
    const res = await axios.post(
      `${config.baseURL}/checkout/create-payment-intent`,
      paymentData,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Create guest payment intent for direct frontend payment
export async function createGuestPaymentIntent(paymentData) {
  try {
    const res = await axios.post(
      `${config.baseURL}/checkout/create-guest-payment-intent`,
      paymentData,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Confirm payment completion
export async function confirmPayment(paymentData) {
  try {
    const res = await axios.post(
      `${config.baseURL}/checkout/confirm-payment`,
      paymentData,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
