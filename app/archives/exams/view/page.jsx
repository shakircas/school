"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  RotateCcw,
  FileSearch,
  Loader2,
  ChevronRight,
  CalendarDays,
  FileDown,
  LayoutGrid,
  History,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewArchivedExams() {
  const [year, setYear] = useState("");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  // Load archive summary for the dropdown
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/archive/stats");
        const data = await res.json();
        const examArchives =
          data.stats?.filter((s) => s.type === "Exams") || [];
        setAvailableYears(examArchives);
      } catch (err) {
        console.error("Failed to fetch archive summary");
      }
    }
    fetchSummary();
  }, []);

  async function loadExams() {
    if (!year) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/archive/exams/read?year=${year}`);
      const data = await res.json();
      setExams(data.data || []);
    } catch (err) {
      setExams([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(recordId = null) {
    const isBulk = !recordId;
    if (
      !confirm(
        isBulk
          ? `Restore ALL exams for ${year}?`
          : "Restore this exam configuration?",
      )
    )
      return;

    setActionLoading(recordId || "bulk");
    try {
      const res = await fetch("/api/archive/exams/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, recordId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadExams();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const exportCSV = () => {
    const headers = ["Exam Name", "Type", "Start Date", "End Date", "Subjects"];
    const rows = exams.map((e) => [
      e.name,
      e.examType,
      new Date(e.startDate).toLocaleDateString(),
      new Date(e.endDate).toLocaleDateString(),
      e.schedule.length,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Exam_Archive_${year}.csv`;
    link.click();
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Exam Archive Vault
              </h1>
              <p className="text-sm text-slate-500">
                Historical exam types, dates, and schedules.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-10 border-2 rounded-lg px-3 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-48"
            >
              <option value="">Select Session</option>
              {/* {availableYears.map((y) => (
                <option key={y.name} value={y.year}>
                  {y.year}
                </option>
              ))} */}
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
            <Button
              onClick={loadExams}
              disabled={loading || !year}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search size={18} className="mr-2" />
              )}
              Fetch
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        {exams.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <History size={18} className="text-indigo-500" />
              <span className="text-sm font-bold">
                {exams.length} Exams in Cold Storage
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="flex-1"
              >
                <FileDown size={14} className="mr-2" /> Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore()}
                disabled={actionLoading}
                className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                {actionLoading === "bulk" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RotateCcw size={14} className="mr-2" />
                )}
                Restore Year
              </Button>
            </div>
          </div>
        )}

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Card
              key={exam._id}
              className="hover:shadow-lg transition-all border border-slate-200 overflow-hidden"
            >
              <div className="h-2 bg-indigo-500" /> {/* Brand accent line */}
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">
                    {exam.examType}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Archive
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                    {exam.name}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 mt-1">
                    <CalendarDays size={12} />
                    <span className="text-xs font-medium">
                      {new Date(exam.startDate).toLocaleDateString()} -{" "}
                      {new Date(exam.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-3 border-y border-slate-50 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-400" />
                    <span className="text-sm font-bold">
                      {exam.schedule.length} Subjects
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-indigo-600 hover:bg-indigo-50 h-9 text-xs font-bold"
                  onClick={() => handleRestore(exam._id)}
                  disabled={actionLoading}
                >
                  <span className="flex items-center gap-2">
                    {actionLoading === exam._id ? (
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
        {!loading && exams.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
              <FileSearch className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">No archives selected</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an academic year to pull records from the vault.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
