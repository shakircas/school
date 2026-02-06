"use client";

import { useState } from "react";

export default function ArchiveAttendancePage() {
  const [year, setYear] = useState("2024-25");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function archiveAttendance() {
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch("/api/archive/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear: year }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage(`✅ ${data.message}`);
        setSuccess(true);
      }
    } catch (err) {
      setMessage("❌ Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-red-700">
        Archive Attendance (Admin)
      </h1>

      <p className="text-sm text-gray-600">
        ⚠ Once archived, attendance becomes <b>read-only</b> and is removed from
        the live database.
      </p>

      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="border p-2 w-full rounded"
        disabled={loading || success}
      >
        <option value="2023-24">2023-24</option>
        <option value="2024-25">2024-25</option>
      </select>

      <button
        onClick={archiveAttendance}
        disabled={loading || success}
        className="bg-red-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {loading ? "Archiving..." : "Archive Attendance"}
      </button>

      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
}
