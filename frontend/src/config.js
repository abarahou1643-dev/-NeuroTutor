// config.js - Configuration centrale
export const API_CONFIG = {
  AUTH_SERVICE: "http://localhost:8080",
  EXERCISE_SERVICE: "http://localhost:8083",
  AI_SERVICE: "http://localhost:8082",
  FRONTEND_URL: "http://localhost:5174"
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/login`,
    REGISTER: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/register`,
    REFRESH: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/refresh`,
    HEALTH: `${API_CONFIG.AUTH_SERVICE}/health`
  },
  DIAGNOSTIC: {
    START: `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/start`,
    SUBMIT: (testId) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/submit/${testId}`,
    RESULT: (studentId) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/result/${studentId}`,
    HEALTH: `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/health`
  },
  EXERCISES: {
    BASE: `${API_CONFIG.EXERCISE_SERVICE}/api/v1/exercises`,
    HEALTH: `${API_CONFIG.EXERCISE_SERVICE}/health`
  },
  AI: {
    HEALTH: `${API_CONFIG.AI_SERVICE}/health`,
    EVALUATE: `${API_CONFIG.AI_SERVICE}/api/v1/ai/evaluate`
  }
};

export const APP_CONFIG = {
  APP_NAME: "NeuroTutor",
  VERSION: "1.0.0",
  DEFAULT_TIMEOUT: 10000,
  STORAGE_KEYS: {
    TOKEN: "neurotutor_token",
    USER: "neurotutor_user",
    USER_LEVEL: "neurotutor_user_level",
    DIAGNOSTIC_RESULT: "neurotutor_diagnostic_result"
  }
};