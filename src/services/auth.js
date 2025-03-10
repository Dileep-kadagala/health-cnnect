import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  // Patient Authentication
  patientLogin: async (loginData) => {
    try {
      const response = await api.post('/auth/patient/login', loginData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', 'patient');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  patientRegister: async (userData) => {
    try {
      const response = await api.post('/auth/patient/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', 'patient');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Doctor Authentication
  doctorLogin: async (registrationNumber, password) => {
    try {
      const response = await api.post('/auth/doctor/login', { registrationNumber, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', 'doctor');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  doctorRegister: async (userData) => {
    try {
      const response = await api.post('/auth/doctor/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', 'doctor');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('role');
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
};



export default authService; 