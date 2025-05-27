import axios from 'axios';
import { API_BASE } from '../config/config';

const axiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 30000
});

axiosInstance.interceptors.request.use(
    (config) => {
        // Set default headers
        config.headers = {
            ...config.headers,
            'Content-Type': 'application/json'
        };

        // Add auth token if exists
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Special handling for registration endpoint
        if (config.url === '/auth/register') {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with an error
            console.error('Server Error:', {
                status: error.response.status,
                data: error.response.data,
                endpoint: error.config.url,
                method: error.config.method
            });

            if (error.response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
        }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network Error: No response received', {
                url: error.config.url,
                method: error.config.method,
                baseURL: error.config.baseURL
            });
        } else {
            // Error in request configuration
            console.error('Request Configuration Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
