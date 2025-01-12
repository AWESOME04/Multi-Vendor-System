import { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "react-toastify";
import * as api from '../../services/api';

const GlobalContext = createContext();

const initialState = {
  products: [],
  cart: [],
  cartQuantity: 0,
  orders: [],
  loading: false,
  error: null,
  user: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "GET_PRODUCTS":
      return { ...state, products: action.payload };
    case "GET_CART":
      return { 
        ...state, 
        cart: action.payload.items || [], 
        cartQuantity: (action.payload.items || []).length 
      };
    case "ADD_TO_CART":
      return { 
        ...state, 
        cart: action.payload.items,
        cartQuantity: action.payload.items.length
      };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      dispatch({ type: "SET_USER", payload: user });
      
      // Only fetch cart for buyers
      if (user?.role?.toLowerCase() === 'buyer') {
        getCart();
      } else {
        // Initialize empty cart for non-buyers
        dispatch({ type: "GET_CART", payload: { items: [] } });
      }
    }
  }, []);

  const getProducts = async () => {
    try {
      const { data } = await api.getProducts();
      if (Array.isArray(data)) {
        dispatch({ type: "GET_PRODUCTS", payload: data });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const getCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // Double-check role before making API call
      if (!user || user.role?.toLowerCase() !== 'buyer') {
        dispatch({ type: "GET_CART", payload: { items: [] } });
        return;
      }

      const { data } = await api.getCart();
      if (data && data.items) {
        dispatch({ type: "GET_CART", payload: data });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Silently handle errors and set empty cart
      dispatch({ type: "GET_CART", payload: { items: [] } });
    }
  };

  const addToCart = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Please login to add items to cart');
        return;
      }
      if (user.role.toLowerCase() !== 'buyer') {
        toast.error('Only buyers can add items to cart');
        return;
      }

      const { data } = await api.addToCart({
        productId: product._id,
        quantity: 1,
        price: product.price
      });

      if (data) {
        dispatch({ type: "ADD_TO_CART", payload: data });
        toast.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Don't show error toast for role-related issues
      if (!error.message?.includes('Only buyers')) {
        toast.error('Failed to add item to cart');
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.updateCartQuantity(productId, newQuantity);
      if (response?.items) {
        dispatch({ type: "GET_CART", payload: response });
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update quantity';
      toast.error(errorMessage);
      getCart(); // Refresh cart state
    }
  };

  const addQuantity = (productId) => {
    const item = state.cart.find(item => item.productId === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  const reduceQuantity = (productId) => {
    const item = state.cart.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.removeFromCart(productId);
      if (response?.items) {
        dispatch({ type: "GET_CART", payload: response });
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item';
      toast.error(errorMessage);
      getCart(); // Refresh cart state
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.clearCart();
      if (response) {
        dispatch({ type: "GET_CART", payload: { items: [], total: 0 } });
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
      toast.error(errorMessage);
    }
  };

  const createOrder = async () => {
    try {
      const response = await api.createOrder();
      if (response) {
        await clearCart();
        toast.success('Order placed successfully!');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
      toast.error(errorMessage);
    }
  };

  const value = {
    state,
    getProducts,
    getCart,
    addToCart,
    addQuantity,
    reduceQuantity,
    removeFromCart,
    clearCart,
    createOrder
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalContextProvider");
  }
  return context;
};

export { GlobalContextProvider, useGlobalContext };
