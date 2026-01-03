// src/config.js
export const API_CONFIG = {
  AUTH_SERVICE: "http://127.0.0.1:8081",
  EXERCISE_SERVICE: "http://127.0.0.1:8083",
  AI_SERVICE: "http://127.0.0.1:8082",
  FRONTEND_URL: "http://127.0.0.1:5174",
};

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  USER_LEVEL: "userLevel",
  DIAGNOSTIC_RESULT: "diagnosticResult",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/login`,
    REGISTER: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/register`,
    ME: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/me`,
    DIAGNOSTIC_COMPLETE: `${API_CONFIG.AUTH_SERVICE}/api/v1/auth/diagnostic/complete`,
  },
  DIAGNOSTIC: {
    START: `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/start`,
    SUBMIT: (testId) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/submit/${testId}`,
    RESULT: (studentId) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/diagnostic/result/${studentId}`,
  },
  EXERCISES: {
    LIST: `${API_CONFIG.EXERCISE_SERVICE}/api/v1/exercises`,
    BY_ID: (id) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/exercises/${id}`,
  },
  SUBMISSIONS: {
    JSON: (exerciseId) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/submissions/${exerciseId}`,
    MULTIPART: (exerciseId) => `${API_CONFIG.EXERCISE_SERVICE}/api/v1/submissions/${exerciseId}/multipart`,
  },
  AI: {
    HEALTH: `${API_CONFIG.AI_SERVICE}/health`,
    OCR_CAP: `${API_CONFIG.AI_SERVICE}/ocr/ocr/capabilities`,
    OCR_PROCESS: `${API_CONFIG.AI_SERVICE}/ocr/ocr/process`,
    OCR_ANALYZE: `${API_CONFIG.AI_SERVICE}/ocr/ocr/analyze`,
    EVALUATE: `${API_CONFIG.AI_SERVICE}/evaluation/evaluate`,
  },
};
