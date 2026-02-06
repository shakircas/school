"use client";

import { useState } from "react";

export default function ViewArchivedAttendancePage() {
  const [year, setYear] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadArchivedAttendance() {
    if (!year) return;

    setLoading(true);
    setError("");
    setRecords([]);

    try {
      const res = await fetch(`/api/archive/attendance/read?year=${year}`);

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load data");
      } else {
        setRecords(data.data || []);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Archived Attendance (Read-Only)</h1>

      <div className="flex gap-2">
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Academic Year (e.g. 2023-24)"
          className="border p-2 rounded w-64"
        />

        <button
          onClick={loadArchivedAttendance}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load
        </button>
      </div>

      {loading && <p className="text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {records.map((att) => (
          <div key={att._id} className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between">
              <p className="font-semibold">
                {new Date(att.date).toDateString()}
              </p>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Archived
              </span>
            </div>

            <p className="text-sm">
              Class: {att.classId} | Section: {att.sectionId}
            </p>

            <p className="text-sm">
              Total Records: <b>{att.records.length}</b>
            </p>
          </div>
        ))}
      </div>

      {!loading && records.length === 0 && year && (
        <p className="text-sm text-gray-500">No archived attendance found.</p>
      )}
    </div>
  );
}
