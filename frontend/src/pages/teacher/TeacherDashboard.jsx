// frontend/src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchStudents, fetchStudentProgress } from "../../services/teacher";
import { Link } from "react-router-dom";

/**
 * ✅ Evite "Invalid Date"
 * - si null/undefined/"" => "-"
 * - si format non valide => "-"
 */
const safeDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("fr-FR");
};

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState({}); // { [studentId]: { data?, loading?, error? } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fullName = useMemo(
    () => (s) => `${s?.firstName || ""} ${s?.lastName || ""}`.trim() || "(Sans nom)",
    []
  );

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      // 1) charger les élèves
      const studs = await fetchStudents();
      const list = Array.isArray(studs) ? studs : [];
      setStudents(list);

      // init progress = loading pour tous
      const init = Object.fromEntries(
        list.map((s) => [s.id, { loading: true, data: null, error: "" }])
      );
      setProgress(init);

      // 2) charger le progrès de chaque élève (en parallèle)
      const entries = await Promise.all(
        list.map(async (s) => {
          try {
            const data = await fetchStudentProgress(s.id);
            return [s.id, { loading: false, data, error: "" }];
          } catch (e) {
            return [
              s.id,
              {
                loading: false,
                data: null,
                error: e?.message || "Impossible de charger",
              },
            ];
          }
        })
      );

      setProgress(Object.fromEntries(entries));
    } catch (e) {
      setError(e?.message || "Erreur lors du chargement");
      setStudents([]);
      setProgress({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">❌ {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Enseignant</h1>
        <div className="flex gap-2">
          <Link className="px-4 py-2 rounded bg-indigo-600 text-white" to="/teacher/exercises">
            Gérer les exercices
          </Link>
          <button className="px-4 py-2 rounded bg-gray-100" onClick={load}>
            Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Élèves</h2>

        {students.length === 0 ? (
          <div className="text-gray-600">Aucun élève.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Nom</th>
                  <th>Email</th>
                  <th>Soumissions</th>
                  <th>Correct</th>
                  <th>Score</th>
                  <th>Dernière activité</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => {
                  const p = progress[s.id]; // {loading, data, error}
                  const data = p?.data;

                  return (
                    <tr key={s.id} className="border-b">
                      <td className="py-2">{fullName(s)}</td>
                      <td>{s.email || "-"}</td>

                      {p?.loading ? (
                        <>
                          <td colSpan={4} className="text-gray-500">
                            Chargement du progrès…
                          </td>
                        </>
                      ) : p?.error ? (
                        <>
                          <td colSpan={4} className="text-red-600">
                            ❌ {p.error}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{data?.totalSubmissions ?? 0}</td>
                          <td>{data?.correctSubmissions ?? 0}</td>
                          <td>{data?.totalScore ?? 0}</td>
                          <td>{safeDate(data?.lastSubmissionAt)}</td>
                        </>
                      )}

                      <td className="text-right">
                        <Link
                          to={`/teacher/students/${s.id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
