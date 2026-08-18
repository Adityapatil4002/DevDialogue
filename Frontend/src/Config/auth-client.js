import { createAuthClient } from "better-auth/client"; // (or "better-auth/react" if you are using the React specific import)

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "https://devdialogue.onrender.com",

  // ✅ Add this entire fetchOptions block
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("devdialogue_token") || "",
    },
    onSuccess: (ctx) => {
      // Get the token from the response headers
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        // Store the token securely in localStorage
        localStorage.setItem("devdialogue_token", authToken);
      }
    },
  },
});
