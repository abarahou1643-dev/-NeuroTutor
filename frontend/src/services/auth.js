// src/services/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/auth';

// Configuration axios avec intercepteur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);

  // ✅ stocker token + user
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data));

  return response.data;
};


export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/refresh', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    // Déconnexion si refresh échoue
    logout();
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};