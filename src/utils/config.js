const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  // You can throw an error or log a warning here
  // For production, throwing is safer to avoid silent misconfig
  throw new Error('VITE_API_URL environment variable is not set! Please define it in your .env file.');
}

const config = {
  baseURL: apiUrl,
};

export { config };
