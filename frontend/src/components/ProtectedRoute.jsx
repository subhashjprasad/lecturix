// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>; // Optional: Loading state while checking authentication
  }

  return isAuthenticated ? element : <Navigate to="/" />; // Redirect to home if not authenticated
};

export default ProtectedRoute;

// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ element: Component, condition, redirectTo = "/" }) => {
//   const isAuthenticated = /* logic to check if the teacher is logged in */;

//   // Check if both authenticated and the folder has been clicked
//   if (!isAuthenticated || (condition !== undefined && !condition)) {
//     return <Navigate to={redirectTo} />;
//   }

//   return <Component />;
// };

// export default ProtectedRoute;
