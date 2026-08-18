import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://devdialogue.onrender.com",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("devdialogue_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
