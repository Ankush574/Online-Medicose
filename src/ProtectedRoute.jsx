import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Layout from "./Layout";

const roleHomeMap = {
  Doctor: "/doctor-dashboard",
  Pharmacist: "/pharmacist-dashboard",
  Admin: "/admin-dashboard"
};

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
    const fallbackRoute = roleHomeMap[user?.role] || "/dashboard";
    return <Navigate to={fallbackRoute} replace />;
  }

  return <Layout>{element}</Layout>;
};

export default ProtectedRoute;
