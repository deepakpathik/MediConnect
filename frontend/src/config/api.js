import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';


const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// console.log('API URL configured:', API_BASE_URL, 'Platform:', Platform.OS);

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    // console.log('📝 Request Data:', config.data);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('🔴 Token Error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('🔴 Request Setup Error:', error);
    return Promise.reject({
      ...error,
      message: 'Failed to setup request: ' + (error.message || 'Unknown error')
    });
  }
);

api.interceptors.response.use(
  (response) => {
    // console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      // Don't log 401 for login as error (common case for invalid credentials/demo account)
      const isLogin401 = error.response.status === 401 && error.config?.url?.includes('/auth/login');
      const logMethod = isLogin401 ? console.warn : console.error;

      logMethod(`❌ ${error.response.status} ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url || 'unknown-endpoint'}`);
      if (!isLogin401) {
        console.error('Error Details:', error.response.data);
      }
    } else if (error.request) {
      console.error('❌ No response received:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        message: error.message
      });
      error.message = 'Cannot connect to server. Please check your internet connection.';
    } else {
      console.error('❌ Request setup error:', error.message);
    }

    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        console.error('Failed to clear auth data:', storageError);
      }
    }

    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message || 'Network Error'
    });
  }
);

export default api;
