import axios from "axios";

// Create the axios instance
const instance = axios.create({
  // Logic: If Vercel provides an API URL, use it. Otherwise, use localhost.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

// Add an asynchronous request "interceptor"
instance.interceptors.request.use(
  async (config) => {
    // Check if Clerk is loaded and a user session exists
    if (window.Clerk && window.Clerk.session) {
      try {
        // Await the fresh, secure token directly from Clerk
        const token = await window.Clerk.session.getToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error(
          "Error fetching Clerk token in Axios interceptor:",
          error,
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
