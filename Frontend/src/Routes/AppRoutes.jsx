import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/login.jsx";
import Register from "../screens/Register.jsx";
import Home from "../screens/Home.jsx";
import Project from "../screens/Project.jsx";
import UserProfile from "../screens/UserProfile.jsx";
import LandingPage from "../screens/Landing-page.jsx";
import Dashboard from "../screens/Dashboard.jsx"; // <--- Make sure this import is added
import UserAuth from "../auth/UserAuth.jsx";

const AppRoutes = () => {
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

        {/* --- NEW DASHBOARD ROUTE --- */}
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
