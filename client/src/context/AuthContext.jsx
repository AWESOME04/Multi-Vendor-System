import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import { setAuthToken, removeAuthToken, getAuthToken } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          setAuthToken(token); // Set token for API calls
          const response = await api.getUserProfile();
          const userData = response.data;
          
          if (userData && userData.token) {
            // Update token if a new one is provided
            setAuthToken(userData.token);
            setUser(userData);
          } else {
            removeAuthToken();
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          removeAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No auth token');
      }

      const response = await api.getUserProfile();
      const userData = response.data;
      
      if (userData) {
        setUser({ ...userData, token });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        removeAuthToken();
        setUser(null);
        toast.error('Session expired. Please login again.');
      }
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.loginUser(email, password);
      const userData = response.data;
      
      if (!userData || !userData.token) {
        throw new Error('Invalid response from server');
      }

      setAuthToken(userData.token);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await api.registerUser({
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role
      });

      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout,
        isAuthenticated: !!user,
        isSeller: user?.role === 'SELLER'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
