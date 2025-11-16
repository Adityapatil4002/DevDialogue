import axios from "axios";

// 1. Create the axios instance
const instance = axios.create({
  // SET YOUR BACKEND'S BASE URL HERE
  baseURL: "http://localhost:8080",
});

// 2. Add a request "interceptor"
// This function runs BEFORE every request is sent
instance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default instance;
