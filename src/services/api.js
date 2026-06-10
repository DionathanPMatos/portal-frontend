import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

const apiClient = axios.create({
    baseURL: API_URL,
});

// 🚀 A MÁGICA DO JWT ACONTECE AQUI
// Antes de qualquer requisição sair para o backend, o Axios executa isso:
apiClient.interceptors.request.use((config) => {
    // Busca o crachá que salvamos no cofre do navegador (localStorage)
    const token = localStorage.getItem('@portal_token');
    
    if (token) {
        // Se tem token, anexa no formato padrão de segurança (Bearer)
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;