"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  History,
  RotateCcw,
  Calendar,
  Users,
  Layers,
  Loader2,
  AlertCircle,
  FileSearch,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewArchivedAttendancePage() {
  const [year, setYear] = useState("");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // Fetch the list of available archives for the dropdown on mount

  async function loadArchivedAttendance() {
    if (!year) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/archive/attendance/read?year=${year}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.data || []);
    } catch (err) {
      setError(err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  // Generate CSV of the currently viewed records
  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = ["Date", "Class ID", "Section ID", "Total Students"];
    const rows = records.map((att) => [
      new Date(att.date).toLocaleDateString(),
      att.classId,
      att.sectionId,
      att.records.length,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_Archive_${year}.csv`);
    link.click();
  };

  async function handleRestore(recordId = null) {
    const isBulk = !recordId;
    if (
      !confirm(
        isBulk ? "Restore ALL records for this year?" : "Restore this day?",
      )
    )
      return;

    setActionLoading(recordId || "bulk");
    try {
      const res = await fetch("/api/archive/attendance/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, recordId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadArchivedAttendance();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="text-blue-600" /> Attendance Archive Explorer
            </h1>
            <p className="text-slate-500 text-sm">
              Browse historical records and restore them to the live database if
              needed.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border-2 border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-red-500 transition-all outline-none bg-white"
              disabled={loading}
            >
              <option value="">Select Academic Year</option>
              <option value="2023-2024">2023-2024 (Past)</option>
              <option value="2024-2025">2024-2025 (Past)</option>
              <option value="2025-2026">2025-2026 (Current)</option>
            </select>
            <Button
              onClick={loadArchivedAttendance}
              disabled={loading || !year}
            >
              {loading ? <Loader2 className="animate-spin" /> : "View Logs"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Action Bar */}
        {records.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border p-4 rounded-xl gap-4">
            <div className="flex items-center gap-3">
              <Layers className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Archive Content: {year}
                </p>
                <p className="text-xs text-slate-500">
                  {records.length} dates found in storage.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex-1 bg-white"
              >
                <FileDown size={14} className="mr-2" /> Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"
                onClick={() => handleRestore()}
                disabled={actionLoading}
              >
                {actionLoading === "bulk" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RotateCcw size={14} className="mr-2" />
                )}
                Restore All
              </Button>
            </div>
          </div>
        )}

        {/* Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((att) => (
            <Card
              key={att._id}
              className="hover:shadow-md transition-all border-slate-200"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-slate-400"
                  >
                    READ-ONLY
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    {new Date(att.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight font-medium">
                    Class {att.classId} • Section {att.sectionId}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm py-2 border-y border-slate-50">
                  <Users size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700">
                    {att.records.length}
                  </span>
                  <span className="text-slate-500 text-xs">Total Students</span>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-blue-600 hover:bg-blue-50 h-8 text-xs font-bold"
                  onClick={() => handleRestore(att._id)}
                  disabled={actionLoading}
                >
                  <span className="flex items-center gap-2">
                    {actionLoading === att._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RotateCcw size={12} />
                    )}
                    Restore to Live
                  </span>
                  <ChevronRight size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!loading && records.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-slate-50/50">
            <FileSearch className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-600 font-medium">
              No archived records loaded.
            </p>
            <p className="text-xs text-slate-400">
              Select an academic year above to explore archives.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
