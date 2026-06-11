import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('@portal_token');
    const tenantId = localStorage.getItem('@portal_tenant_id'); // 👈 Captura o tenantId salvo no login
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🚀 Envia o tenant_id no cabeçalho para o backend
    if (tenantId) {
        config.headers['x-tenant-id'] = tenantId;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;