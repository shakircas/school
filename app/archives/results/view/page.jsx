"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";

export default function ViewArchivedResults() {
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadResults() {
    setLoading(true);
    const res = await fetch(`/api/archive/results/read?year=${year}`);
    const data = await res.json();
    setResults(data.data || []);
    setLoading(false);
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-bold">Archived Results</h1>

        <div className="flex gap-2">
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Academic Year (2023-24)"
            className="border p-2 w-64"
          />
          <button
            onClick={loadResults}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Load
          </button>
        </div>

        {loading && <p>Loading...</p>}

        <div className="space-y-4">
          {results.map((r) => (
            <div key={r._id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between">
                <h3 className="font-semibold">Student: {r.student}</h3>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  Archived
                </span>
              </div>

              <p className="text-sm">Academic Year: {r.academicYear}</p>

              <p className="text-sm">
                Percentage: <b>{r.percentage}%</b>
              </p>

              <p className="text-sm">
                Status: <b>{r.status}</b>
              </p>

              <p className="text-sm">Subjects: {r.subjects.length}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
