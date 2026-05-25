import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isLoggedIn, isAdmin }) => {
    // Se o usuário não estiver logado ou não for admin, redirecione para o Dashboard
    if (!isLoggedIn || !isAdmin) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;