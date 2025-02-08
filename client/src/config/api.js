import axios from 'axios';

// Base URLs for different services
const AUTH_SERVICE_URL = 'https://auth-service-rbc3.onrender.com';
const PRODUCT_SERVICE_URL = 'https://product-service-qwti.onrender.com';
const ORDER_SERVICE_URL = 'https://order-service-uag9.onrender.com';
const NOTIFICATION_SERVICE_URL = 'https://notification-service-lpes.onrender.com';

// API endpoints configuration
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    PROFILE: '/auth/profile',
    
    // Product endpoints
    PRODUCTS: '/',
    PRODUCTS_SELLER: '/product/seller',
    PRODUCT_CREATE: '/product/create',
    PRODUCT_UPDATE: '/product/update',
    PRODUCT_DELETE: '/product/delete',
    
    // Order endpoints
    CART: '/cart',
    ORDERS: '/orders',
    ORDER_CREATE: '/orders/create',
    
    // Notification endpoints
    NOTIFY_ORDER: '/notify/order-created'
};

// Common axios config
const defaultConfig = {
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json'
    },
    // Add retry logic
    retry: 3,
    retryDelay: 1000
};

// Create axios instances for different services
const api = axios.create({
    ...defaultConfig,
    baseURL: AUTH_SERVICE_URL
});

export const productApi = axios.create({
    ...defaultConfig,
    baseURL: PRODUCT_SERVICE_URL
});

export const orderApi = axios.create({
    baseURL: import.meta.env.VITE_ORDER_SERVICE_URL || 'https://order-service-uag9.onrender.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const notificationApi = axios.create({
    ...defaultConfig,
    baseURL: NOTIFICATION_SERVICE_URL
});

// Add retry interceptor
const retryInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.response.use(null, async (error) => {
        const config = error.config;
        
        if (!config || !config.retry) return Promise.reject(error);
        
        config.retryCount = config.retryCount || 0;
        
        if (config.retryCount >= config.retry) {
            return Promise.reject(error);
        }
        
        config.retryCount += 1;
        const delayRetry = new Promise(resolve => 
            setTimeout(resolve, config.retryDelay || 1000)
        );
        
        await delayRetry;
        console.log(`Retrying request (${config.retryCount}/${config.retry})`);
        return axiosInstance(config);
    });
};

// Request interceptor to add auth token
const addAuthToken = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// Add interceptors to all service instances
const apiInstances = [api, productApi, orderApi, notificationApi];
apiInstances.forEach(instance => {
    instance.interceptors.request.use(addAuthToken);
    retryInterceptor(instance);
});

// Auth token management functions
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        apiInstances.forEach(instance => {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        });
    } else {
        localStorage.removeItem('token');
        apiInstances.forEach(instance => {
            delete instance.defaults.headers.common['Authorization'];
        });
    }
};

export const removeAuthToken = () => {
    localStorage.removeItem('token');
    apiInstances.forEach(instance => {
        delete instance.defaults.headers.common['Authorization'];
    });
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Add request interceptor to add auth token
orderApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;