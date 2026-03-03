import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Adjust this if your backend runs on a different port/host
});

export default api;
