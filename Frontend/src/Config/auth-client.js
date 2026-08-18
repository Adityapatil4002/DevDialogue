import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  // ✅ Update the baseURL to use the Vercel proxy route
  baseURL: "/api/auth",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("devdialogue_token") || "",
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("devdialogue_token", authToken);
      }
    },
  },
});
