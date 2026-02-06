"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";

export default function ArchiveStudentsPage() {
  const [graduationYear, setGraduationYear] = useState("2024-2025");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function archiveStudents() {
    if (!classId) {
      setMessage("❌ Please select Class 10");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/archive/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graduationYear,
        classId,
      }),
    });

    const data = await res.json();

    setLoading(false);
    setMessage(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
  }

  return (
    <MainLayout>
      <div className="max-w-xl p-6 space-y-4">
        <h1 className="text-xl font-bold">Archive Graduated Students</h1>

        {/* Graduation Year */}
        <div>
          <label className="text-sm font-medium">Graduation Year</label>
          <select
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="border p-2 w-full mt-1"
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>

        {/* Class */}
        <div>
          <label className="text-sm font-medium">Graduating Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="border p-2 w-full mt-1"
          >
            <option value="">Select Class</option>
            <option value="CLASS10_ID_HERE">Class 10</option>
          </select>
        </div>

        <button
          onClick={archiveStudents}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Archiving..." : "Archive Class 10"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </div>
    </MainLayout>
  );
}
