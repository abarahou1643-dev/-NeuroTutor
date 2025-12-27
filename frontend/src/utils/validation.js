// src/utils/validation.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateExercise = (exercise) => {
  const errors = {};

  if (!exercise.title || exercise.title.trim().length < 3) {
    errors.title = "Le titre doit contenir au moins 3 caractères";
  }

  if (!exercise.difficulty || !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(exercise.difficulty)) {
    errors.difficulty = "Difficulté invalide";
  }

  return errors;
};

export const validateDiagnosticAnswer = (answer) => {
  return answer && answer.trim().length > 0;
};

export const isStrongPassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers;
};

export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Retirer les balises HTML
    .substring(0, 1000); // Limiter la longueur
};