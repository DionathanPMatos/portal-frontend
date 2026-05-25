import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Spinner, Container } from 'react-bootstrap';

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o "Provedor" que vai gerenciar os dados do usuário
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Chama a rota que você já tem no seu backend
                const response = await axios.get('/user-data');
                setUser(response.data);
            } catch (error) {
                // Se der erro (ex: não logado), o usuário continua como null
                console.error("Usuário não autenticado ou erro ao buscar dados:", error.response?.data?.error);
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
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Cria um hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};