// src/services/diagnostic.js
const API_BASE = 'http://localhost:8083/api/v1/diagnostic';

export const diagnosticService = {
  // Démarrer un test diagnostique
  async startDiagnostic(studentId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur démarrage test diagnostique:', error);
      throw error;
    }
  },

  // Soumettre les réponses
  async submitDiagnostic(testId, studentId, answers) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/submit/${testId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, answers })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur soumission test:', error);
      throw error;
    }
  },

  // Récupérer le résultat
  async getDiagnosticResult(studentId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/result/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        return null; // Pas encore de test
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération résultat:', error);
      return null;
    }
  },

  // Vérifier la santé du service
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};