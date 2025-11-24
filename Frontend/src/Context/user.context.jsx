import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../Config/axios.js"; // Ensure this path matches your axios config

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Add a loading state to prevent "flashing" the login screen while checking auth
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        // We call the /profile endpoint we just created
        const res = await axios.get("/users/profile");

        // If successful, set the user data (including new fields like bio/settings)
        setUser(res.data.user);
      } catch (error) {
        console.log("No user logged in or token expired");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Run this check when the app mounts
    checkUserLoggedIn();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {/* Optional: You can block the whole app rendering until loading is false 
         to prevent 'glitching', but standard rendering is usually fine.
      */}
      {children}
    </UserContext.Provider>
  );
};
