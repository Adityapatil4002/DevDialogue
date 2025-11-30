import axios from "axios";

// Create the axios instance
const instance = axios.create({
  // Logic: If Vercel provides an API URL, use it. Otherwise, use localhost.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

// Add a request "interceptor"
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
