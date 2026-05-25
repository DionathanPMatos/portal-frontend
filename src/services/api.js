// src/services/api.js
import axios from 'axios';

const api = axios.create({
    // O Vite injeta as variáveis de ambiente através do import.meta.env
    baseURL: import.meta.env.VITE_API_URL,
    
    // MUITO IMPORTANTE: Como seu backend usa express-session e CORS com credentials: true,
    // o frontend precisa enviar os cookies em todas as requisições.
    withCredentials: true,
});

export default api;
