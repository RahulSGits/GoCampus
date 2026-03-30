import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Verifying Session...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Very strict role validation checks
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Kick them back simply based on their specific origin
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default ProtectedRoute;
