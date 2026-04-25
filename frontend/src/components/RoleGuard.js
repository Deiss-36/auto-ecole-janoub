import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="d-flex min-vh-100 justify-content-center align-items-center"><div className="spinner-grow text-primary"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if they don't have access
        if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
        if (user.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
        return <Navigate to="/dashboard" replace />; // Default for admin/secretary
    }

    return children;
};

export default RoleGuard;
