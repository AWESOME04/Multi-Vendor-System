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
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "GET_PRODUCTS":
      return { ...state, products: action.payload, loading: false };
    case "GET_CART":
      return { 
        ...state, 
        cart: action.payload.items || [], 
        cartQuantity: (action.payload.items || []).length,
        loading: false 
      };
    case "ADD_TO_CART":
      return {
        ...state,
        cart: [...state.cart, action.payload],
        cartQuantity: state.cartQuantity + 1,
        loading: false
      };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter(item => item.productId !== action.payload),
        cartQuantity: state.cartQuantity - 1,
        loading: false
      };
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        loading: false
      };
    case "GET_ORDERS":
      return { ...state, orders: action.payload, loading: false };
    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
        cartQuantity: 0,
        loading: false
      };
    default:
      return state;
  }
};

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load cart on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCart();
    }
  }, []);

  const getProducts = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.getProducts();
      dispatch({ type: "GET_PRODUCTS", payload: data.products });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const getCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.getCart();
      dispatch({ type: "GET_CART", payload: data });
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart');
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const addToCart = async (product) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
      dispatch({ type: "ADD_TO_CART", payload: data });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await api.removeFromCart(productId);
      dispatch({ type: "REMOVE_FROM_CART", payload: productId });
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.addToCart({
        productId,
        quantity
      });
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId, quantity } });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const createOrder = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.createOrder();
      dispatch({ type: "CLEAR_CART" });
      toast.success('Order created successfully');
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const getOrders = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data } = await api.getOrders();
      dispatch({ type: "GET_ORDERS", payload: data });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        state,
        getProducts,
        getCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        createOrder,
        getOrders
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within GlobalContextProvider");
  }
  return context;
};

export { GlobalContextProvider, useGlobalContext };
