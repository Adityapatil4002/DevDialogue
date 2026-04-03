import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "../Config/auth-client.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Better Auth: fetch the current session on app load
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) {
          // Map Better Auth user to the shape your app expects
          setUser({
            _id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            ...data.user,
          });
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
