import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { useUser } from "../Context/user.context.jsx";
import Loader from "../components/Loader.jsx";

import Login from "../screens/login.jsx";
import Register from "../screens/register.jsx";
import Home from "../screens/Home.jsx";
import Project from "../screens/project.jsx";
import UserProfile from "../screens/UserProfile.jsx";
import LandingPage from "../screens/Landing-page.jsx";
import Dashboard from "../screens/Dashboard.jsx";
import UserAuth from "../auth/UserAuth.jsx";

const AppRoutes = () => {
  const { loading } = useUser();

  if (loading) return <Loader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/*" element={<Login />} />
        <Route path="/register/*" element={<Register />} />

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
