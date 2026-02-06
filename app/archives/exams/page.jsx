"use client";

import { useState } from "react";

export default function ArchiveExamsPage() {
  const [year, setYear] = useState("2024-25");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function archive() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/archive/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ academicYear: year }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) setMsg(`❌ ${data.error}`);
    else setMsg(`✅ ${data.message}`);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-red-700">Archive Exams</h1>

      <p className="text-sm text-gray-600">
        ⚠ Archived exams become read-only and removed from live data.
      </p>

      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="border p-2 w-full"
      >
        <option>2023-24</option>
        <option>2024-25</option>
      </select>

      <button
        onClick={archive}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Archiving..." : "Archive Exams"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
