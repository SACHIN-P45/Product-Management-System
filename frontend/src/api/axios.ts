/// <reference types="vite/client" />
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://product-management-system-ux66.onrender.com'
        : 'http://localhost:5000',
});

export default api;
