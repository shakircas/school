"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useEffect, useState } from "react";

export default function ArchivedStudentsView() {
  const [graduationYear, setGraduationYear] = useState("2024-2025");
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchStudents() {
    if (!classId) return;

    setLoading(true);

    const res = await fetch("/api/archive/students/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graduationYear,
        classId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.students) setStudents(data.students);
  }

  async function restoreStudent(studentId) {
    if (!confirm("Restore this student?")) return;

    await fetch("/api/archive/students/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graduationYear,
        classId,
        studentId,
      }),
    });

    fetchStudents();
  }

  async function restoreAll() {
    if (!confirm("Restore ALL students for this class?")) return;

    await fetch("/api/archive/students/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graduationYear,
        classId,
      }),
    });

    fetchStudents();
  }

  useEffect(() => {
    fetchStudents();
  }, [graduationYear, classId]);

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl space-y-4">
        <h1 className="text-xl font-bold">Archived Graduated Students</h1>

        <div className="flex gap-4 items-center">
          <select
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="border p-2"
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="border p-2"
          >
            <option value="">Select Class</option>
            <option value="CLASS10_ID_HERE">Class 10</option>
          </select>

          <button
            onClick={restoreAll}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={!classId}
          >
            Restore All
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border mt-4 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Roll</th>
                <th className="p-2">Class</th>
                <th className="p-2">Section</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.rollNumber}</td>
                  <td className="p-2">{s.lastClassId}</td>
                  <td className="p-2">{s.sectionId}</td>
                  <td className="p-2">
                    <button
                      onClick={() => restoreStudent(s._id)}
                      className="text-blue-600 underline"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
}
