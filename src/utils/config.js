const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';

const config = {
  baseURL: isProd
    ? 'https://e-comerce-backend-mmvv.onrender.com/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api',
};

export { config };
