import api, { API_ENDPOINTS, productApi, orderApi, notificationApi } from '../config/api';
import { uploadImage } from '../config/cloudinary';

// Auth Service
export const loginUser = async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response;
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
        const { data } = response.data;
        if (!data || !data.id || !data.token) {
            throw new Error('Invalid response from server');
        }
        return data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        if (error.message) {
            throw new Error(error.message);
        }
        throw new Error('Registration failed. Please try again.');
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.PROFILE);
        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Product Service
export const getProducts = async () => {
    try {
        const response = await productApi.get(API_ENDPOINTS.PRODUCTS, {
            timeout: 30000
        });
        return response.data;
    } catch (error) {
        console.error('Product API Error:', error);
        if (error.code === 'ECONNABORTED') {
            throw new Error('The request took too long to complete. Please try again.');
        }
        throw error;
    }
};

export const getSellerProducts = async () => {
  try {
    const response = await productApi.get(API_ENDPOINTS.PRODUCTS_SELLER);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await productApi.post(API_ENDPOINTS.PRODUCT_CREATE, productData);
    console.log('Product creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('The request took too long to complete. Please try again.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to create product. Please try again.');
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await productApi.put(
      `${API_ENDPOINTS.PRODUCT_UPDATE}/${productId}`, 
      productData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await productApi.delete(
      `${API_ENDPOINTS.PRODUCT_DELETE}/${productId}`
    );
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

export const searchProducts = async (query) => {
  try {
    console.log('Searching products with query:', query);
    const response = await productApi.get('/products/search', {
      params: { 
        name: query,  
        desc: query   
      }
    });
    console.log('Search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Search error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

// Shopping Service
export const getCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        return { data: { items: [], total: 0 } };
    }
    
    const role = user.role?.toLowerCase();
    if (role !== 'buyer') {
        return { data: { items: [], total: 0 } };
    }
    
    const response = await orderApi.get(`${API_ENDPOINTS.CART}?customerId=${user.id}`);
    console.log('Cart API response:', response);
    return response;
};

export const addToCart = async (productData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Product Data received:', productData);
    
    if (!user) {
        throw new Error('Please login to add items to cart');
    }
    
    const role = user.role?.toLowerCase();
    if (role !== 'buyer') {
        throw new Error('Only buyers can add to cart');
    }

    try {
        const cartData = {
            customerId: user.id,
            productId: productData.id,
            name: productData.name,
            price: parseFloat(productData.price),
            quantity: productData.quantity || 1,
            image: productData.image || ''
        };
        
        console.log('Sending cart data:', cartData);
        const response = await orderApi.post(API_ENDPOINTS.CART, cartData);
        console.log('Cart response:', response);
        return response;
    } catch (error) {
        console.error('Cart error details:', error.response?.data);
        throw error;
    }
};

export const getOrders = async () => {
    const response = await orderApi.get('/orders');
    return response.data;
};

export const createOrder = async (orderData) => {
  try {
    const response = await orderApi.post('/orders/create', orderData);
    // Notify the notification service about the new order
    await notificationApi.post('/notify/order-created', {
      orderId: response.data.orderId,
      userId: response.data.userId,
      orderDetails: response.data
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateCartQuantity = async (productId, quantity) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(user?.role?.toLowerCase() === 'buyer')) {
        throw new Error('Only buyers can update cart');
    }
    const response = await orderApi.patch(`${API_ENDPOINTS.CART}/${productId}`, { 
        customerId: user.id,
        quantity 
    });
    return response.data;
};

export const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(user?.role?.toLowerCase() === 'buyer')) {
        throw new Error('Only buyers can remove from cart');
    }
    const response = await orderApi.delete(`${API_ENDPOINTS.CART}/${productId}?customerId=${user.id}`);
    return response.data;
};

export const clearCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(user?.role?.toLowerCase() === 'buyer')) {
        throw new Error('Only buyers can clear cart');
    }
    const response = await orderApi.delete(`${API_ENDPOINTS.CART}?customerId=${user.id}`);
    return response.data;
};