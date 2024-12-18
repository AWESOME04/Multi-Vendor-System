import { createContext, useContext, useReducer } from "react";
import { toast } from "react-toastify";

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
      return { ...state, products: dummyProducts };
    case "ADD_TO_CART":
      const updatedProducts = state.products.map((product) =>
        product._id === action.payload
          ? { ...product, addedToCart: true }
          : product
      );
      const addedProduct = state.products.find(
        (product) => product._id === action.payload
      );
      return {
        ...state,
        products: updatedProducts,
        cart: [...state.cart, { ...addedProduct, quantity: 1 }],
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

export const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getProducts = async () => {
    try {
      dispatch({ type: "GET_PRODUCTS" });
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = (productId) => {
    dispatch({ type: "ADD_TO_CART", payload: productId });
    toast.success("Added to cart!");
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    toast.success("Removed from cart!");
  };

  const updateCartItemQuantity = (productId, quantity) => {
    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <GlobalContext.Provider
      value={{
        state,
        getProducts,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
