import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../Context/user.context";
import Loader from "../components/Loader";

const UserAuth = ({ children }) => {
  const { user, loading, isSignedIn } = useUser();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserAuth;
