import axios from 'axios';
import { API_BASE } from '../config/config';

const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
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
                endpoint: error.config.url
            });

            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/auth';
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network Error: No response received', {
                url: error.config.url,
                method: error.config.method
            });
        } else {
            // Error in request configuration
            console.error('Request Configuration Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
