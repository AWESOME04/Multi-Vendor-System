import { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken, removeAuthToken, getAuthToken } from '../config/api';
import api from '../config/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = getAuthToken();
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.id) {
            setUser(userData);
          } else {
            console.log('Invalid user data found in localStorage');
            logout();
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          logout();
        }
      }
    } catch (error) {
      console.error('Error in auth initialization:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      console.log('Login response:', response);

      const { id, email: userEmail, role, token } = response.data;

      if (!token || !id || !role) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }

      const userData = {
        id,
        email: userEmail,
        role,
      };

      setAuthToken(token);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/signup', userData);
      console.log('Register response:', response);

      const { id, email, role, token } = response.data.data;

      if (!token || !id || !role) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }

      const newUser = {
        id,
        email,
        role,
      };

      setAuthToken(token);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    try {
      removeAuthToken();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isSeller: user?.role?.toLowerCase() === 'seller',
    isBuyer: user?.role?.toLowerCase() === 'buyer'
  };

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
