// src/services/diagnostic.js
const API_BASE = "/exo/api/v1/diagnostic";

export const diagnosticService = {
  async startDiagnostic(studentId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ studentId }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  },

  async submitDiagnostic(testId, studentId, answers) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/submit/${testId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ studentId, answers }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  },

  async getDiagnosticResult(studentId) {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/result/${encodeURIComponent(studentId)}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (response.status === 404) return null;
    if (!response.ok) return null;

    return await response.json();
  },

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
