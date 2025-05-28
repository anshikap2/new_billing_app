import axios from 'axios';
import { API_BASE } from '../config/config';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // Reduced to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with timeout controller
axiosInstance.interceptors.request.use(
  (config) => {
    // Add abort controller for timeout
    const controller = new AbortController();
    config.signal = controller.signal;
    config.timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    // Skip auth check for login and register
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config;
    }

    if (!token || !userId) {
      console.error('Missing auth:', { hasToken: !!token, userId });
      return Promise.reject(new Error('Authentication required'));
    }

    // Special handling for FormData (file uploads)
    if (config.data instanceof FormData) {
      config.headers['Authorization'] = `Bearer ${token}`;
      delete config.headers['Content-Type']; // Let browser set for FormData
      return config;
    }

    // Regular request handling
    config.headers['Authorization'] = `Bearer ${token}`;
    if (!config.url?.includes('/auth/upload-image')) {
      config.params = { ...config.params, user_id: userId };
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry interceptor with exponential backoff
axiosInstance.interceptors.response.use(null, async (error) => {
  const { config } = error;

  // Clear timeout if it exists
  if (config?.timeoutId) {
    clearTimeout(config.timeoutId);
  }

  // Handle timeout specifically
  if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
    console.warn(`Request timeout for ${config.url}`, {
      timeout: config.timeout,
      retryCount: config.__retryCount
    });
  }

  if (!config || config.__isRetryRequest || config.data instanceof FormData) {
    return Promise.reject(error);
  }

  // Exponential backoff retry delay
  config.__retryCount = config.__retryCount || 0;
  config.retry = config.retry ?? 3;
  const backoffDelay = Math.min(1000 * Math.pow(2, config.__retryCount), 10000);

  if (config.__retryCount >= config.retry) {
    console.error('Max retries reached:', {
      url: config.url,
      attempts: config.__retryCount
    });
    return Promise.reject(error);
  }

  config.__retryCount += 1;
  config.__isRetryRequest = true;

  console.warn(`Retrying request (${config.__retryCount}/${config.retry}):`, {
    url: config.url,
    delay: backoffDelay
  });

  await new Promise(resolve => setTimeout(resolve, backoffDelay));
  return axiosInstance(config);
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Clear timeout on success
    if (response.config.timeoutId) {
      clearTimeout(response.config.timeoutId);
    }

    // Handle login response
    if (response.config.url?.includes('/auth/login')) {
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', user.user_id || user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('username', user.username || user.userName);

        console.log('Interceptor stored auth:', {
          userId: user.user_id || user.id,
          hasToken: true
        });
      }
    }
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle authentication errors
    if (response?.status === 401) {
      console.warn('Auth: Token expired or invalid');
      localStorage.clear();
      window.location.href = '/home'; // Force navigation to home
      return Promise.reject(new Error('Authentication required'));
    }

    // Log different types of errors
    if (response) {
      console.error('Server Error:', {
        status: response.status,
        data: response.data,
        endpoint: response.config.url,
        method: response.config.method,
      });
    } else if (error.request) {
      console.error('Network Error: No response received', {
        url: response.config?.url,
        method: response.config?.method,
        baseURL: response.config?.baseURL,
      });
    } else {
      console.error('Request Configuration Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;