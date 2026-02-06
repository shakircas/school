"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";

export default function ArchiveResultsPage() {
  const [year, setYear] = useState("2024-25");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function archiveResults() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/archive/results", {
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
    <MainLayout>
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-bold text-red-700">Archive Results</h1>

        <p className="text-sm text-gray-600">
          ⚠ Archived results become read-only and removed from live data.
        </p>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 w-full"
        >
          <option>2023-2024</option>
          <option>2024-2025</option>
          <option>2025-2026</option>
        </select>

        <button
          onClick={archiveResults}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Archiving..." : "Archive Results"}
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </MainLayout>
  );
}
