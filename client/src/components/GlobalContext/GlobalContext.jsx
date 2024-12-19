import { createContext, useContext, useReducer } from "react";
import { toast } from "react-toastify";
import axios from 'axios';

const GlobalContext = createContext();

const dummyProducts = [
  {
    _id: '1',
    name: 'Premium Headphones',
    price: 299,
    description: 'High-quality wireless headphones with noise cancellation',
    rating: 5,
    addedToCart: false,
    product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  },
  {
    _id: '2',
    name: 'Gaming Headset',
    price: 199,
    description: 'Professional gaming headset with surround sound',
    rating: 4,
    addedToCart: false,
    product_image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500',
  },
  {
    _id: '3',
    name: 'Wireless Earbuds',
    price: 159,
    description: 'True wireless earbuds with long battery life',
    rating: 4,
    addedToCart: false,
    product_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
  },
  {
    _id: '4',
    name: 'Studio Headphones',
    price: 349,
    description: 'Professional studio headphones for audio production',
    rating: 5,
    addedToCart: false,
    product_image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
  },
  {
    _id: '5',
    name: 'Sports Headphones',
    price: 129,
    description: 'Sweat-resistant headphones for workouts',
    rating: 4,
    addedToCart: false,
    product_image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
  },
  {
    _id: '6',
    name: 'Kids Headphones',
    price: 49,
    description: 'Volume-limited headphones safe for children',
    rating: 4,
    addedToCart: false,
    product_image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500',
  }
];

const initialState = {
  products: [],
  cart: [],
  cartQuantity: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "GET_PRODUCTS":
      return { ...state, products: action.payload };
    case "ADD_TO_CART":
      const existingCartItem = state.cart.find(item => item._id === action.payload._id);
      if (existingCartItem) {
        toast.info('Item already in cart');
        return state;
      }
      
      const updatedProducts = state.products.map((product) =>
        product._id === action.payload._id
          ? { ...product, addedToCart: true }
          : product
      );

      return {
        ...state,
        products: updatedProducts,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
        cartQuantity: state.cartQuantity + 1,
      };

    case "REMOVE_FROM_CART":
      const filteredCart = state.cart.filter(
        (item) => item._id !== action.payload
      );
      const removedProducts = state.products.map((product) =>
        product._id === action.payload
          ? { ...product, addedToCart: false }
          : product
      );
      return {
        ...state,
        products: removedProducts,
        cart: filteredCart,
        cartQuantity: state.cartQuantity - 1,
      };

    case "UPDATE_CART_QUANTITY":
      const updatedCart = state.cart.map((item) =>
        item._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        cart: updatedCart,
        cartQuantity: updatedCart.reduce((total, item) => total + item.quantity, 0),
      };

    case "CLEAR_CART":
      const clearedProducts = state.products.map(product => ({
        ...product,
        addedToCart: false
      }));
      return {
        ...state,
        products: clearedProducts,
        cart: [],
        cartQuantity: 0,
      };

    default:
      return state;
  }
};

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      dispatch({ type: "GET_PRODUCTS", payload: response.data.products });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const addToCart = (product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
    toast.success('Added to cart!');
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    toast.success('Removed from cart');
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const addQuantity = (productId) => {
    const item = state.cart.find((item) => item._id === productId);
    if (item) {
      updateCartQuantity(productId, item.quantity + 1);
    }
  };

  const reduceQuantity = (productId) => {
    const item = state.cart.find((item) => item._id === productId);
    if (item) {
      updateCartQuantity(productId, item.quantity - 1);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        state,
        getProducts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addQuantity,
        reduceQuantity,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContextProvider };
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
