import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../Config/axios.js";

// Create the Context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // This 'loading' state is the key to your "System Boot" screen
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
        // Once this is false, the Loader will disappear and the App will show
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

// Custom Hook for easier usage
export const useUser = () => {
  return useContext(UserContext);
};
