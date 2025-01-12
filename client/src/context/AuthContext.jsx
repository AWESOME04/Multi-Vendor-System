import { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '@/config/api';
import * as api from '@/services/api';
import { userApi } from '@/config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setAuthToken(token);
          const response = await api.getUserProfile();
          console.log('User profile:', response); // Debug log
          setUser(response);
        } catch (error) {
          console.error('Error restoring auth state:', error);
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.loginUser(email, password);
      console.log('Login response:', response); // Debug log
      
      // Check if we have a valid response with token
      if (response?.data?.token) {
        const token = response.data.token;
        const userData = response.data.user || response.data; // Fallback if user data is in root
        
        localStorage.setItem('token', token);
        setAuthToken(token);
        setUser(userData);
        return userData;
      } else {
        console.error('Invalid login response:', response);
        throw new Error('Invalid login credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.registerUser(userData);
      if (response?.token) {
        localStorage.setItem('token', response.token);
        setAuthToken(response.token);
        setUser(response);
        return response;
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isSeller: user?.role?.toUpperCase() === 'SELLER',
    isBuyer: user?.role?.toUpperCase() === 'BUYER'
  };

  console.log('Auth context value:', value);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
