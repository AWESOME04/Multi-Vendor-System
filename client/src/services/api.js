import api, { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { productApi } from '../config/api';

// Auth Service
export const loginUser = async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response;
};

export const registerUser = async (userData) => {
    const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    return response.data;
};

// Product Service
export const getProducts = async () => {
  try {
    const response = await productApi.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getSellerProducts = async () => {
  try {
    const response = await productApi.get('/seller', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await productApi.post('/product/create', productData, {
        headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await productApi.post('/upload', formData, {
        headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

// Shopping Service
export const getCart = async () => {
    const response = await axios.get(API_ENDPOINTS.CART, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const addToCart = async (productData) => {
    const response = await axios.post(API_ENDPOINTS.CART, productData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const getOrders = async () => {
    const response = await axios.get(API_ENDPOINTS.ORDERS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const createOrder = async (productId) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.ORDERS}/create`, { productId });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
