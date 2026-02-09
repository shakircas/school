"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  RotateCcw,
  FileSearch,
  Loader2,
  ChevronRight,
  GraduationCap,
  FileDown,
  LayoutGrid,
  History,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewArchivedResults() {
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  // Load the available archives for the dropdown
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/archive/stats");
        const data = await res.json();
        // Filter only for Results archives
        const resultArchives =
          data.stats?.filter((s) => s.type === "Results") || [];
        setAvailableYears(resultArchives);
      } catch (err) {
        console.error("Failed to fetch archive summary");
      }
    }
    fetchSummary();
  }, []);

  async function loadResults() {
    if (!year) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/archive/results/read?year=${year}`);
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(recordId = null) {
    const isBulk = !recordId;
    if (
      !confirm(
        isBulk
          ? `Restore ALL results for ${year}?`
          : "Restore this student's result?",
      )
    )
      return;

    setActionLoading(recordId || "bulk");
    try {
      const res = await fetch("/api/archive/results/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, recordId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadResults(); // Refresh view
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
    const headers = ["Student", "Year", "Percentage", "Status"];
    const rows = results.map((r) => [
      r.student,
      r.academicYear,
      r.percentage,
      r.status,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Results_Archive_${year}.csv`;
    link.click();
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Archived Results
              </h1>
              <p className="text-sm text-slate-500">
                View and manage historical performance data.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-10 border-2 rounded-lg px-3 bg-white text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none w-full md:w-48"
            >
              <option value="">Select Year</option>
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
              onClick={loadResults}
              disabled={loading || !year}
              className="bg-slate-900"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search size={18} className="mr-2" />
              )}
              Search
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        {results.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border-2 border-slate-100 p-4 rounded-2xl gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <LayoutGrid size={18} />
              <span className="text-sm font-bold">
                {results.length} Records Found
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="flex-1"
              >
                <FileDown size={14} className="mr-2" /> Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore()}
                disabled={actionLoading}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <Card
              key={r._id}
              className="hover:shadow-lg transition-all border-2 border-slate-100 group"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                    <GraduationCap size={20} />
                  </div>
                  <Badge
                    variant={r.status === "Pass" ? "success" : "destructive"}
                    className="text-[10px] uppercase"
                  >
                    {r.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 truncate uppercase tracking-tight">
                    {r.student}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {r.academicYear}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Score
                    </p>
                    <p className="text-lg font-black text-slate-700">
                      {r.percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Subjects
                    </p>
                    <p className="text-lg font-black text-slate-700">
                      {r.subjects.length}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-red-600 hover:bg-red-50 h-9 text-xs font-bold px-2"
                  onClick={() => handleRestore(r._id)}
                  disabled={actionLoading}
                >
                  <span className="flex items-center gap-2">
                    {actionLoading === r._id ? (
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
        {!loading && results.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <FileSearch className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-bold text-slate-700">No data loaded</h3>
            <p className="text-xs text-slate-400">
              Choose a year to load the archived results catalog.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
