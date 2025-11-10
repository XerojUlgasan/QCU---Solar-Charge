import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const RequireAdminAuth = ({ children }) => {
    const { isAdminAuthenticated, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!isAdminAuthenticated) {
        return <Navigate to="/admin" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAdminAuth;


