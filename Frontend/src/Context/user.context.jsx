import React, { createContext, useContext } from "react";
// Alias Clerk's hook to 'useClerkUser' so it doesn't collide with your custom hook at the bottom!
import { useUser as useClerkUser, useAuth } from "@clerk/clerk-react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. Let Clerk handle all the loading, fetching, and session management securely!
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const { getToken } = useAuth();

  // 2. Map Clerk's data to look exactly like your old MongoDB data.
  // This maps the Clerk ID to '_id', preventing your Dashboard and other components from breaking.
  const mappedUser = clerkUser
    ? {
        _id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        fullName: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        ...clerkUser,
      }
    : null;

  return (
    <UserContext.Provider
      value={{
        user: mappedUser,
        // We provide a dummy setUser so old components that call setUser don't crash
        setUser: () =>
          console.warn("Authentication state is now fully managed by Clerk!"),
        loading: !isLoaded,
        isSignedIn,
        getToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Optional: Custom hook for cleaner imports in newer files (Kept exactly as you had it!)
export const useUser = () => {
  return useContext(UserContext);
};
