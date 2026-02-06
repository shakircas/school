"use client";

import { useState } from "react";

export default function ViewArchivedExams() {
  const [year, setYear] = useState("");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/archive/exams/read?year=${year}`);
    const data = await res.json();
    setExams(data.data || []);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Archived Exams</h1>

      <div className="flex gap-2">
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Academic Year (2023-24)"
          className="border p-2 w-64"
        />
        <button
          onClick={load}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam._id} className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between">
              <h3 className="font-semibold">{exam.name}</h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Archived
              </span>
            </div>

            <p className="text-sm">
              {exam.examType} | {exam.academicYear}
            </p>

            <p className="text-sm">
              {new Date(exam.startDate).toDateString()} →{" "}
              {new Date(exam.endDate).toDateString()}
            </p>

            <p className="text-sm">
              Subjects: <b>{exam.schedule.length}</b>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
