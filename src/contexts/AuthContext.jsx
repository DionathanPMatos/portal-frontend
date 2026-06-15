import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import apiClient from '../services/api'; 

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o "Provedor" que vai gerenciar os dados do usuário
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // PASSO A: O usuário acabou de voltar da Microsoft? A URL tem ?token=... ?
                const urlParams = new URLSearchParams(window.location.search);
                const tokenFromUrl = urlParams.get('token');

                if (tokenFromUrl) {
                    // Guarda o token da Microsoft no cofre do navegador
                    localStorage.setItem('@portal_token', tokenFromUrl);
                    
                    // Limpa a barra de endereços (URL) para esconder o token do usuário (Clean Code visual)
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                // PASSO B: Pega o token atual (seja o recém-salvo da Microsoft, ou um login antigo)
                const storedToken = localStorage.getItem('@portal_token');

                if (!storedToken) {
                    // Se não tem token de forma alguma, o usuário não está logado.
                    setLoading(false);
                    return;
                }

                // PASSO C: Valida o Token no Backend e traz os dados do usuário + tenant_id
                // Nosso interceptor no api.js já vai colocar o cabeçalho Authorization automaticamente!
                const response = await apiClient.get('/api/auth/me'); 
                
                setUser(response.data);
            } catch (error) {
                console.error("Sessão expirada ou token inválido:", error.response?.data?.error);
                // Se o backend rejeitar o token (expirou ou fraudado), limpamos tudo.
                localStorage.removeItem('@portal_token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // PASSO D: O novo fluxo de Logout do SaaS
    const handleLogout = () => {
        // Agora, deslogar significa apenas destruir o "crachá" do navegador
        localStorage.removeItem('@portal_token');
        setUser(null);
        window.location.href = '/login'; 
    };

    // O valor do contexto é memoizado para evitar re-renderizações desnecessárias nos consumidores.
    const value = useMemo(() => ({
        user,
        setUser,
        isLoggedIn: !!user,
        isLoading: loading,
        onLogout: handleLogout
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Cria um hook customizado
export const useAuth = () => {
    return useContext(AuthContext);
};