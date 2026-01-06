import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const checkAdmin = () => {
    // In real app, check token. For MVP just return true or mock.
    return true;
};

export default api;
