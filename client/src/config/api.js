import axios from 'axios';

// Base URLs for services
const USER_SERVICE = 'http://localhost:8001';
const PRODUCT_SERVICE = 'http://localhost:8002';
const SHOPPING_SERVICE = 'http://localhost:8003';

export const API_ENDPOINTS = {
    // User Service
    LOGIN: `${USER_SERVICE}/login`,
    SIGNUP: `${USER_SERVICE}/signup`,
    PROFILE: `${USER_SERVICE}/profile`,
    
    // Product Service
    PRODUCTS: `${PRODUCT_SERVICE}/`,
    PRODUCT_CREATE: `${PRODUCT_SERVICE}/product/create`,
    
    // Shopping Service
    CART: `${SHOPPING_SERVICE}/cart`,
    ORDERS: `${SHOPPING_SERVICE}/orders`
};

// Create axios instances for each service
export const userApi = axios.create({
    baseURL: USER_SERVICE,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const productApi = axios.create({
    baseURL: PRODUCT_SERVICE,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const shoppingApi = axios.create({
    baseURL: SHOPPING_SERVICE,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to all instances
[userApi, productApi, shoppingApi].forEach(api => {
    api.interceptors.request.use(
        config => {
            const token = getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                removeAuthToken();
            }
            return Promise.reject(error);
        }
    );
});

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        [userApi, productApi, shoppingApi].forEach(api => {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        });
    }
};

export const removeAuthToken = () => {
    localStorage.removeItem('token');
    [userApi, productApi, shoppingApi].forEach(api => {
        delete api.defaults.headers.common['Authorization'];
    });
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

export default userApi; // Default export for backward compatibility
