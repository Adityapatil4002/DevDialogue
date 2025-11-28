import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../Config/axios.js";

// --- FIXED: ADDED 'export' HERE ---
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await axios.get("/user/profile");
        setUser(res.data.user);
      } catch (error) {
        console.log("No user logged in or token expired");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Optional: Custom hook for cleaner imports in newer files
export const useUser = () => {
  return useContext(UserContext);
};
