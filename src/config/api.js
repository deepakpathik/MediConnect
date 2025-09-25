import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
// Change this to your computer's IP address when using physical devices
const LOCAL_IP = '10.2.87.148'; // Your machine's IP address

const getApiUrl = () => {
  if (Platform.OS === 'android') {
    // For physical Android devices, use your machine's IP
    // For Android Emulator, you can use 10.0.2.2
    return `http://${LOCAL_IP}:3000/api`;
  }
  // For iOS Simulator
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

console.log('API URL configured:', API_URL, 'Platform:', Platform.OS);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.message);
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
    }
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
