import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Register new user
  register: async (email, password, name) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
      }, {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Register API error:', error.message);
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw { error: 'Connection timeout. Please check your network.' };
      }
      throw error.response?.data || { error: 'Cannot connect to server' };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.message);
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw { error: 'Connection timeout. Please check your network.' };
      }
      throw error.response?.data || { error: 'Cannot connect to server' };
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user' };
    }
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
};
