import React, { createContext, useState, useEffect, useContext } from 'react';
import { Spinner, Container } from 'react-bootstrap';
import apiClient from '../services/api'; // Importa a instância configurada do Axios

// ==========================================
// 🚀 CONFIGURAÇÃO GLOBAL DO AXIOS (MOVIDA PARA src/services/api.js)
// Agora, todas as requisições usarão 'apiClient'
// O SEGREDO DO LOGIN: 'withCredentials' já está configurado em apiClient
// ==========================================

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o "Provedor" que vai gerenciar os dados do usuário
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Como configuramos o baseURL acima, agora basta chamar a rota limpa!
                const response = await apiClient.get('/user-data'); // Usa apiClient
                setUser(response.data);
            } catch (error) {
                console.error("Usuário não autenticado:", error.response?.data?.error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Mostra um spinner enquanto carrega os dados do usuário
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    // Disponibiliza o 'user' para todos os componentes filhos
    const handleLogout = () => {
        // Usa apiClient para garantir que a URL base e credenciais sejam enviadas
        window.location.href = `${apiClient.defaults.baseURL}/auth/microsoft/logout`;
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isLoggedIn: !!user, isLoading: loading, onLogout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Cria um hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};