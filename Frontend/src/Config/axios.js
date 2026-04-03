import axios from "axios";

// Better Auth uses HTTP-only cookies — no manual token attachment needed.
// Just set withCredentials: true so cookies are sent on every request.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: true, // ✅ This sends the Better Auth session cookie automatically
});

export default instance;
