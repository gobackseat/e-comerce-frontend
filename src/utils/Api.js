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
    const res = await axios.get(`${config.baseURL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function addToCart(productId, count, token) {
  try {
    const res = await axios.post(
      `${config.baseURL}/cart`,
      { productId, count },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return res.data.data;
  } catch (err) {
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
  // Same as addToCart, since backend upserts
  return addToCart({ productId, count }, token);
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

export async function createPaymentIntent(orderId, token) {
  try {
    const res = await axios.post(`${config.baseURL}/orders/${orderId}/payment-intent`, {}, {
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
