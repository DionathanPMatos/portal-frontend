import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Spinner, Container } from 'react-bootstrap';

// ==========================================
// 🚀 CONFIGURAÇÃO GLOBAL DO AXIOS
// ==========================================
// Aponta todas as requisições para a API correta
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.baseURL = API_URL;

// O SEGREDO DO LOGIN: Permite que o navegador envie os cookies (sessão) para o Backend
axios.defaults.withCredentials = true; 
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
                const response = await axios.get('/user-data');
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

// ... (Mantenha o resto do código do arquivo igualzinho a partir daqui)

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