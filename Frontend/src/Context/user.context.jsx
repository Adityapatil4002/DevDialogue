import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "../Config/auth-client.js";
import axios from "../Config/axios.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aiUsage, setAiUsage] = useState({
    limit: 20,
    used: 0,
    remaining: 20,
    resetInSeconds: 0,
    resetInHuman: "Now",
    percentageUsed: 0,
    isLimited: false,
  });

  const refreshAiUsage = async () => {
    try {
      const res = await axios.get("/user/ai-usage");
      setAiUsage(res.data);
    } catch (err) {
      console.error("Failed to fetch AI usage:", err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();

        if (data?.user) {
          try {
            const res = await axios.get("/user/profile");
            setUser(res.data.user);

            // fetch usage after user is confirmed
            try {
              const usageRes = await axios.get("/user/ai-usage");
              setAiUsage(usageRes.data);
            } catch {
              // keep defaults
            }
          } catch {
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
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        isSignedIn,
        aiUsage,
        setAiUsage,
        refreshAiUsage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
