import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios"; // Import axios to fetch the user

const UserAuth = ({ children }) => {
  // Get both 'user' and 'setUser' from the context
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs once on load to validate the user's session

    if (!token) {
      // Case 1: No token at all. Force login.
      console.log("UserAuth: No token found, redirecting to login.");
      navigate("/login");
      return; // Stop execution
    }

    if (user) {
      // Case 2: User is already in context (e.g., just logged in and navigated).
      // We are authenticated.
      console.log("UserAuth: User found in context.");
      setLoading(false);
      return;
    }

    // Case 3: Token exists, but no user in context (e.g., page refresh).
    // We must fetch the user's data to verify the token.
    const fetchUser = async () => {
      console.log(
        "UserAuth: Token found, no user in context. Fetching user..."
      );
      try {
        // Your axios config already adds the token to the header.
        // This request will either succeed or fail (401) if the token is bad.
        const res = await axios.get("/user/profile"); // Assuming you have a /profile route

        if (res.data.user) {
          // Token is valid, put user data into context
          console.log("UserAuth: User fetched successfully.");
          setUser(res.data.user);
        } else {
          // Should not happen, but good to check
          throw new Error("Invalid user data from /profile");
        }
      } catch (error) {
        // Token is invalid or expired
        console.error("UserAuth: Auth error, token is bad.", error);
        localStorage.removeItem("token"); // Clean up the bad token
        navigate("/login"); // Force re-login
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUser();
  }, [user, setUser, token, navigate]); // Dependencies for the effect

  if (loading) {
    // Show a loading screen while we validate the token
    return <div>Loading...</div>;
  }

  // If loading is false AND we have a user, render the protected components
  return <>{children}</>;
};

export default UserAuth;
