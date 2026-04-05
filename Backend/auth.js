import "dotenv/config";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    defaultCookieAttributes: {
      secure: true, // ✅ required when sameSite is "none"
      httpOnly: true,
      sameSite: "none", // ✅ allows cross-origin cookie sending
      path: "/",
    },
  },

  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:4000",
    "https://dev-dialogue.vercel.app",
    "https://devdialogue.onrender.com",
  ],
});
