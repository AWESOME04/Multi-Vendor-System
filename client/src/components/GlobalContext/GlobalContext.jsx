import { createContext, useContext, useReducer, useEffect, useState } from "react";
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
        cartQuantity: action.payload.items ? action.payload.items.length : 0 
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
    case "SET_CART_QUANTITY":
      return {
        ...state,
        cartQuantity: action.payload
      };
    case "UPDATE_CART_ITEM":
      const updatedCart = state.cart.map(item => 
        item.productId === action.payload.productId 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        cart: updatedCart,
        cartQuantity: updatedCart.length
      };
    case "REMOVE_CART_ITEM":
      const filteredCart = state.cart.filter(item => item.productId !== action.payload);
      return {
        ...state,
        cart: filteredCart,
        cartQuantity: filteredCart.length
      };
    default:
      return state;
  }
};

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Add a Set to track removed items
  const [removedItems] = useState(new Set());

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
      const response = await api.getCart();
      if (response?.data) {
        // Filter out any removed items
        const filteredItems = response.data.items?.filter(
          item => !removedItems.has(item.productId)
        ) || [];

        dispatch({ 
          type: "GET_CART", 
          payload: {
            items: filteredItems,
            total: response.data.total
          }
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Please login to add items to cart');
        return;
      }

      // Check if item is already in cart
      const isInCart = state.cart.some(
        item => String(item.productId) === String(product.id)
      );

      if (isInCart) {
        toast.info('Item is already in your cart');
        return;
      }

      if (user.role.toLowerCase() !== 'buyer') {
        toast.error('Only buyers can add items to cart');
        return;
      }

      // Ensure we have a valid productId
      if (!product.id) {
        console.error('Missing product ID:', product);
        toast.error('Invalid product data');
        return;
      }

      const response = await api.addToCart(product);

      if (response?.data) {
        dispatch({ 
          type: "GET_CART", 
          payload: {
            items: response.data.items || [],
            total: response.data.total || 0
          }
        });
        
        toast.success('Item added to cart');
        await getCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      dispatch({
        type: "UPDATE_CART_ITEM",
        payload: { productId, quantity }
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const addQuantity = (productId) => {
    const item = state.cart.find(item => item.productId === productId);
    if (item) {
      updateCartItemQuantity(productId, item.quantity + 1);
    }
  };

  const reduceQuantity = (productId) => {
    const item = state.cart.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      updateCartItemQuantity(productId, item.quantity - 1);
    }
  };

  const removeFromCart = (productId) => {
    try {
      // Add to removed items set
      removedItems.add(productId);

      dispatch({
        type: "REMOVE_CART_ITEM",
        payload: productId
      });
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
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
    createOrder,
    updateCartItemQuantity
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
