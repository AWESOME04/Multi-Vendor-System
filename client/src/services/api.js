import api, { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { productApi, shoppingApi } from '../config/api';
import { uploadImage } from '../config/cloudinary';

// Auth Service
export const loginUser = async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response;
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
        const { data } = response.data; // Extract data from the response
        if (!data || !data.id || !data.token) {
            throw new Error('Invalid response from server');
        }
        return data;
    } catch (error) {
        // Handle specific error responses from the server
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        // Handle network or other errors
        if (error.message) {
            throw new Error(error.message);
        }
        throw new Error('Registration failed. Please try again.');
    }
};

export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('Getting user profile with token:', token);
        const response = await api.get(API_ENDPOINTS.PROFILE, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('User profile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Product Service
export const getProducts = async () => {
  try {
    const response = await productApi.get('/');
    console.log('Raw Product API Response:', response);
    return response.data;
  } catch (error) {
    console.error('Product API Error:', error);
    throw error;
  }
};

export const getSellerProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Getting seller products with token:', token);
    const response = await productApi.get('/product/seller', {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Seller products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await productApi.post('/product/create', productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Product creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await productApi.put(`/product/update/${productId}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await productApi.delete(`/product/delete/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const uploadProductImage = async (file) => {
  try {
    const imageUrl = await uploadImage(file, 'products');
    return { imageUrl };
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

// Shopping Service
export const getCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.role?.toLowerCase() === 'buyer') {
        return { data: { items: [] } };
    }
    const response = await shoppingApi.get('/cart');
    return response.data;
};

export const addToCart = async (productData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.role?.toLowerCase() === 'buyer') {
        throw new Error('Only buyers can add to cart');
    }
    const response = await shoppingApi.post('/cart', productData);
    return response.data;
};

export const getOrders = async () => {
    const response = await shoppingApi.get('/orders');
    return response.data;
};

export const createOrder = async (productId) => {
  try {
    const response = await shoppingApi.post('/orders/create', { productId });
    // Clear cart after successful order
    await clearCart();
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateCartQuantity = async (productId, quantity) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.role?.toLowerCase() === 'buyer') {
        throw new Error('Only buyers can update cart');
    }
    const response = await shoppingApi.patch(`/cart/${productId}`, { quantity });
    return response.data;
};

export const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.role?.toLowerCase() === 'buyer') {
        throw new Error('Only buyers can remove from cart');
    }
    const response = await shoppingApi.delete(`/cart/${productId}`);
    return response.data;
};

export const clearCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.role?.toLowerCase() === 'buyer') {
        throw new Error('Only buyers can clear cart');
    }
    const response = await shoppingApi.delete('/cart');
    return response.data;
};