import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  // 1) Public env override (works in Expo Go with EXPO_PUBLIC_ vars)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl;
  }

  if (__DEV__) {
    // 2) Derive host from Expo Go/Metro host to avoid hard-coded IPs
    // SDK 54+: prefer expoConfig.hostUri; fall back to legacy manifest fields
    const hostUri =
      Constants.expoConfig?.hostUri ||
      // @ts-ignore - older fields for safety in some environments
      Constants.manifest?.debuggerHost ||
      Constants.manifest2?.extra?.expoClient?.hostUri;

    if (hostUri && typeof hostUri === 'string') {
      const host = hostUri.split(':')[0];
      return `http://${host}:2005/api`;
    }

    // 3) Fallbacks per platform if host cannot be determined
    if (Platform.OS === 'android') {
      // Emulator special host to reach development machine
      return 'http://10.0.2.2:2005/api';
    }
    // iOS simulator default
    return 'http://localhost:2005/api';
  }

  // 4) Production URL (use HTTPS)
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API URL configured:', API_BASE_URL, 'Platform:', Platform.OS);

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📝 Request Data:', config.data);
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
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`❌ ${error.response.status} ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url || 'unknown-endpoint'}`);
      console.error('Error Details:', error.response.data);
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
