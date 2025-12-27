// utils/api.js
import { API_ENDPOINTS } from '../config';

export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error);
    throw error;
  }
};

// Helper pour les requêtes d'authentification
export const authAPI = {
  login: async (credentials) => {
    return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  register: async (userData) => {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token');
    return apiRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

// Helper pour les exercices
export const exerciseAPI = {
  getAllExercises: async () => {
    return apiRequest(API_ENDPOINTS.EXERCISES.BASE);
  },

  createExercise: async (exercise) => {
    return apiRequest(API_ENDPOINTS.EXERCISES.BASE, {
      method: 'POST',
      body: JSON.stringify(exercise)
    });
  },

  getExerciseById: async (id) => {
    return apiRequest(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`);
  }
};

// Helper pour le diagnostic
export const diagnosticAPI = {
  startDiagnostic: async (studentId) => {
    return apiRequest(API_ENDPOINTS.DIAGNOSTIC.START, {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
  },

  submitDiagnostic: async (testId, studentId, answers) => {
    return apiRequest(API_ENDPOINTS.DIAGNOSTIC.SUBMIT(testId), {
      method: 'POST',
      body: JSON.stringify({ studentId, answers })
    });
  },

  getResult: async (studentId) => {
    return apiRequest(API_ENDPOINTS.DIAGNOSTIC.RESULT(studentId));
  }
};