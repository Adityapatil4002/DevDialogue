import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../Context/user.context";
import Loader from "../components/Loader";

const UserAuth = ({ children }) => {
  const { user, loading, isSignedIn } = useUser();
  const location = useLocation();

  // 1. Clerk is still loading? Show loader — DO NOT redirect yet!
  if (loading) {
    return <Loader />;
  }

  // 2. Clerk finished loading, user is NOT signed in — redirect to login
  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. User is signed in — render the protected page
  return <>{children}</>;
};

export default UserAuth;
