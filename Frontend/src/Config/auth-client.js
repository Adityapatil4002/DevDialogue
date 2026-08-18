import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  // ✅ Bypass Vercel's internal /api blocks
  baseURL: `${window.location.origin}/auth-proxy`,
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
