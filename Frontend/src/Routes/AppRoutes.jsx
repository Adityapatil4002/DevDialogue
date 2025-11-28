import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { useUser } from "../Context/user.context.jsx"; // Import the hook we made
import Loader from "../components/Loader.jsx"; // Import your new System Loader

// Screens
import Login from "../screens/login.jsx";
import Register from "../screens/Register.jsx";
import Home from "../screens/Home.jsx";
import Project from "../screens/Project.jsx";
import UserProfile from "../screens/UserProfile.jsx";
import LandingPage from "../screens/Landing-page.jsx";
import Dashboard from "../screens/Dashboard.jsx";
import UserAuth from "../auth/UserAuth.jsx";

const AppRoutes = () => {
  const { loading } = useUser();

  // 1. GLOBAL LOADER INTERCEPTION
  // If the app is checking auth (system booting), show the Loader
  // and block the router until ready.
  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <UserAuth>
              <Home />
            </UserAuth>
          }
        />

        <Route
          path="/project/:projectId"
          element={
            <UserAuth>
              <Project />
            </UserAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <UserAuth>
              <UserProfile />
            </UserAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <UserAuth>
              <Dashboard />
            </UserAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
