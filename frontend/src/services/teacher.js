// src/services/teacher.js
const AUTH_BASE = "/api/v1";     // auth-service via proxy
const EXO_BASE = "/exo/api/v1";  // exercise-service via proxy

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchStudents() {
  const res = await fetch(`${AUTH_BASE}/teacher/students`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchStudentProgress(userId) {
  const res = await fetch(
    `${EXO_BASE}/teacher/students/${encodeURIComponent(userId)}/progress`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTeacherExercise(payload) {
  const res = await fetch(`${EXO_BASE}/teacher/exercises`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTeacherExercise(id, payload) {
  const res = await fetch(`${EXO_BASE}/teacher/exercises/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTeacherExercise(id) {
  const res = await fetch(`${EXO_BASE}/teacher/exercises/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}
