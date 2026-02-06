"use client";
import { useState } from "react";

export default function AcademicYearSettings() {
  const [year, setYear] = useState("2024-25");

  async function saveYear() {
    await fetch("/api/system/academic-year", {
      method: "POST",
      body: JSON.stringify({ year }),
      headers: { "Content-Type": "application/json" },
    });
    alert("Academic year updated");
  }

  return (
    <div className="p-6 max-w-md space-y-4">
      <h1 className="text-xl font-bold">Active Academic Year</h1>

      <input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="border p-2 w-full"
        placeholder="2025-2026"
      />

      <button
        onClick={saveYear}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
