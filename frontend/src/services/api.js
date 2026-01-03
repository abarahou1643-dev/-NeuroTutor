// src/services/api.js
import axios from "axios";
import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from "../config";

// =======================
// Helpers
// =======================
export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "null");
  } catch {
    return null;
  }
};

export const getUserId = () => {
  const u = getStoredUser();
  return u?.userId || u?.id || u?.email || "test@neurotutor.com";
};

export const saveSession = ({ token, user, userLevel, diagnosticResult } = {}) => {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  if (userLevel) localStorage.setItem(STORAGE_KEYS.USER_LEVEL, userLevel);
  if (diagnosticResult)
    localStorage.setItem(STORAGE_KEYS.DIAGNOSTIC_RESULT, JSON.stringify(diagnosticResult));
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.USER_LEVEL);
  localStorage.removeItem(STORAGE_KEYS.DIAGNOSTIC_RESULT);
};

// ✅ Helper pour normaliser: backend renvoie parfois {value:[], Count:n}
const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

// =======================
// Axios instances
// =======================
const attachToken = (config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

export const authApi = axios.create({
  baseURL: `${API_CONFIG.AUTH_SERVICE}/api/v1`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const exercisesApi = axios.create({
  baseURL: `${API_CONFIG.EXERCISE_SERVICE}/api/v1`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const aiApi = axios.create({
  baseURL: API_CONFIG.AI_SERVICE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

authApi.interceptors.request.use(attachToken);
exercisesApi.interceptors.request.use(attachToken);

// =======================
// Services
// =======================
export const authService = {
  login: async (email, password) => {
    const res = await authApi.post("/auth/login", { email, password });
    return res.data;
  },

  register: async (payload) => {
    const res = await authApi.post("/auth/register", payload);
    return res.data;
  },

  me: async () => {
    const res = await authApi.get("/auth/me");
    return res.data;
  },

  saveDiagnostic: async ({ score, level }) => {
    const res = await fetch(API_ENDPOINTS.AUTH.DIAGNOSTIC_COMPLETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ score, level }),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  },
};

export const exerciseService = {
  // ✅ Ton backend supporte difficulty & topic (PAS level)
  getAll: async ({ difficulty, topic } = {}) => {
    const params = new URLSearchParams();
    if (difficulty) params.set("difficulty", difficulty);
    if (topic) params.set("topic", topic);

    const url = params.toString() ? `/exercises?${params.toString()}` : "/exercises";
    const res = await exercisesApi.get(url);
    return unwrapList(res.data);
  },

  getById: async (id) => {
    const res = await exercisesApi.get(`/exercises/${id}`);
    return res.data;
  },
};

export const submissionsService = {
  // ✅ Maintenant backend dispo: GET /submissions/user/{userId}
  listByUser: async (userId = getUserId()) => {
    const res = await exercisesApi.get(`/submissions/user/${encodeURIComponent(userId)}`);
    return unwrapList(res.data) || res.data || [];
  },

  submitJson: async (exerciseId, payload) => {
    // payload peut contenir: {userId, answer} OU {userId, steps, finalAnswer}
    const res = await exercisesApi.post(`/submissions/${exerciseId}`, payload);
    return res.data;
  },

  submitMultipart: async ({ exerciseId, answer = "", userId = getUserId(), imageFile, audioFile }) => {
    const form = new FormData();
    form.append("userId", userId);
    if (answer?.trim()) form.append("answer", answer.trim());
    if (imageFile) form.append("image", imageFile);
    if (audioFile) form.append("audio", audioFile);

    const res = await fetch(API_ENDPOINTS.SUBMISSIONS.MULTIPART(exerciseId), {
      method: "POST",
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      body: form,
    });

    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  },
};

export const diagnosticService = {
  start: async (studentId) => {
    const res = await fetch(API_ENDPOINTS.DIAGNOSTIC.START, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ studentId }),
    });

    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  },

  submit: async (testId, studentId, answers) => {
    const res = await fetch(API_ENDPOINTS.DIAGNOSTIC.SUBMIT(testId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ studentId, answers }),
    });

    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return await res.json();
  },

  getResult: async (studentId) => {
    const res = await fetch(API_ENDPOINTS.DIAGNOSTIC.RESULT(studentId), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  },
};

export const aiService = {
  health: async () => (await aiApi.get("/health")).data,
  ping: async () => (await aiApi.get("/health/ping")).data,

  ocrCapabilities: async () => (await aiApi.get("/ocr/ocr/capabilities")).data,
  ocrProcess: async ({ text = "", image_base64 = null }) =>
    (await aiApi.post("/ocr/ocr/process", { text, image_base64 })).data,
  ocrAnalyze: async ({ text = "", image_base64 = null }) =>
    (await aiApi.post("/ocr/ocr/analyze", { text, image_base64 })).data,

  evaluate: async ({ exercise_id, student_answer, expected_answer, student_id, answer_type = "math" }) =>
    (await aiApi.post("/evaluation/evaluate", { exercise_id, student_answer, expected_answer, student_id, answer_type })).data,
};
