import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "../Config/auth-client.js";
import axios from "../Config/axios.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) {
          // ✅ FIX: Fetch the REAL Mongoose user from your backend
          // This gives us the correct _id that matches message senderIds
          try {
            const res = await axios.get("/user/profile");
            setUser(res.data.user);
          } catch {
            // Fallback: if /user/profile doesn't exist yet, use Better Auth data
            setUser({
              _id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              ...data.user,
            });
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const isSignedIn = !!user;

  return (
    <UserContext.Provider value={{ user, setUser, loading, isSignedIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
