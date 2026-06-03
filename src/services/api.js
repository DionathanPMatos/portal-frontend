import axios from 'axios';

// 🚀 CORREÇÃO: Quando compilado (Túnel/Produção), usa a URL raiz dinamicamente sem forçar IPs
const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

const apiClient = axios.create({
    baseURL: API_URL,
    // MUITO IMPORTANTE: Como seu backend usa express-session e CORS com credentials: true,
    // o frontend precisa enviar os cookies em todas as requisições.
    withCredentials: true,
});

export default apiClient;