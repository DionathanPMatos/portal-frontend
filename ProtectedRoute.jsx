import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = () => {
    const { isLoggedIn, isLoading } = useAuth();

    // 1. Enquanto o AuthContext verifica o token, mostramos um spinner
    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    // 2. Se não estiver logado, redireciona para a página de login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 3. Se estiver logado, renderiza a rota filha (o conteúdo protegido)
    return <Outlet />;
};

export default ProtectedRoute;