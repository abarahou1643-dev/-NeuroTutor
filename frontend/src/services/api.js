// src/services/api.js
import axios from "axios";

export const API_CONFIG = {
  AUTH: "http://localhost:8080/api/v1",
  EXERCISES: "http://localhost:8083/api/v1",
  AI: "http://localhost:8000",
};

// === Instances dédiées ===
export const authApi = axios.create({
  baseURL: API_CONFIG.AUTH,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const exercisesApi = axios.create({
  baseURL: API_CONFIG.EXERCISES,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const aiApi = axios.create({
  baseURL: API_CONFIG.AI,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// === Interceptor token sur Auth + Exercises seulement ===
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

authApi.interceptors.request.use(attachToken, (e) => Promise.reject(e));
exercisesApi.interceptors.request.use(attachToken, (e) => Promise.reject(e));

// === AI service ===
export const aiService = {
  checkHealth: async () => {
    try {
      const response = await aiApi.get("/health");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: { status: "unavailable", service: "ai-service" },
      };
    }
  },

  getOpenAPI: async () => {
    try {
      const response = await aiApi.get("/openapi.json");
      return response.data;
    } catch {
      return null;
    }
  },

  testEndpoint: async (endpoint, data = {}) => {
    try {
      const response = await aiApi.post(endpoint, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  },
};

// Utilitaire fetch (si tu l’utilises ailleurs)
export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("token");
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return await response.json();
}
