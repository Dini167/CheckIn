import axios from 'axios';
import { ApiError } from './ApiError';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const serverError = error.response?.data?.error;

        if (status === 401 && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        if (serverError) {
            return Promise.reject(new ApiError(serverError.message, serverError.code, serverError.details, status));
        }
        return Promise.reject(error);
    }
);

export default api;