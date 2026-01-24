"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import AttendanceCircle from "@/components/reports/AttendanceCircle";
import StudentProgressChart from "@/components/reports/StudentProgressChart";

export default function StudentReportPage({ params }) {
  const { id } = useParams(params);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/student/${id}?year=2025`);
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error("Failed to fetch report", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  console.log(report);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-800">
          Academic Progress Report
        </h1>
        <p className="text-slate-500 text-sm">
          Session 2025-2026 • Student ID: {id}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary Circle */}
        <div className="lg:col-span-1">
          <AttendanceCircle reportData={report} />
        </div>

        {/* Right: Detailed Chart */}
        <div className="lg:col-span-2">
          <StudentProgressChart reportData={report} />
        </div>
      </div>
    </div>
  );
}
