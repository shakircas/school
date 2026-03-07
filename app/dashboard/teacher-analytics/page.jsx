"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Loader2,
  Calendar,
  Search,
  ArrowDownWideNarrow,
  SortAsc,
  Users,
  Clock,
  Filter,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";

export default function TeacherAnalytics() {
  const { data, isLoading } = useSWR("/api/teacher/study-analytics", fetcher);

  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [filterInactivity, setFilterInactivity] = useState(false); // New Filter

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    let result = data.filter((student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Apply Inactivity Filter (Last Activity > 48 Hours)
    if (filterInactivity) {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      result = result.filter(
        (s) => new Date(s.lastActivity) < fortyEightHoursAgo,
      );
    }

    return result.sort((a, b) => {
      if (sortBy === "priority") {
        return a.progress - b.progress;
      }
      return a.studentName.localeCompare(b.studentName);
    });
  }, [data, searchTerm, sortBy, filterInactivity]);

  // --- Global Metrics ---
  const globalMetrics = useMemo(() => {
    if (!data || data.length === 0) return { avg: 0, atRisk: 0, inactive: 0 };
    const totalProgress = data.reduce((acc, curr) => acc + curr.progress, 0);
    const atRiskCount = data.filter((s) => s.progress < 40).length;

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const inactiveCount = data.filter(
      (s) => new Date(s.lastActivity) < fortyEightHoursAgo,
    ).length;

    return {
      avg: Math.round(totalProgress / data.length),
      atRisk: atRiskCount,
      inactive: inactiveCount,
    };
  }, [data]);

  if (isLoading) return <LoadingState />;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">
              <BarChart3 className="w-4 h-4" /> Academic Command Center
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              ADAPTIVE ANALYTICS
            </h1>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            <StatMini
              label="Avg. Mastery"
              value={`${globalMetrics.avg}%`}
              color="text-indigo-600"
            />
            <StatMini
              label="At Risk"
              value={globalMetrics.atRisk}
              color="text-red-500"
            />
            <StatMini
              label="Inactive (48h)"
              value={globalMetrics.inactive}
              color="text-amber-600"
            />
          </div>
        </header>

        {/* Control Bar */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by student..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Toggle Inactivity Filter */}
            <button
              onClick={() => setFilterInactivity(!filterInactivity)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                filterInactivity
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
              }`}
            >
              <Clock className="w-4 h-4" />
              {filterInactivity ? "SHOWING INACTIVE ONLY" : "FILTER INACTIVE"}
            </button>

            {/* Toggle Sort */}
            <button
              onClick={() =>
                setSortBy(sortBy === "priority" ? "name" : "priority")
              }
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              {sortBy === "priority" ? (
                <ArrowDownWideNarrow className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
              {sortBy === "priority" ? "PRIORITY SORT" : "A-Z SORT"}
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-6">
          {filteredAndSortedData.length > 0 ? (
            filteredAndSortedData.map((item, i) => {
              const isInactive =
                new Date(item.lastActivity) <
                new Date(Date.now() - 48 * 60 * 60 * 1000);

              return (
                <div
                  key={i}
                  className={`bg-white rounded-[2.5rem] border p-6 shadow-sm transition-all group ${
                    isInactive
                      ? "border-amber-200 ring-4 ring-amber-500/5"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Profile */}
                    <div className="flex items-center gap-4 min-w-[250px] w-full lg:w-auto">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${
                          isInactive
                            ? "bg-amber-100 text-amber-600"
                            : "bg-slate-50 text-indigo-600"
                        }`}
                      >
                        {item.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 leading-tight">
                            {item.studentName}
                          </h3>
                          {isInactive && (
                            <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" /> Updated{" "}
                          {new Date(item.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Mastery Level
                        </span>
                        <span
                          className={`text-sm font-black ${getProgressColor(item.progress)}`}
                        >
                          {item.progress}%
                        </span>
                      </div>
                      <Progress
                        value={item.progress}
                        className="h-2 bg-slate-100"
                      />
                    </div>

                    {/* Subject Mini-Charts */}
                    <div className="flex-1 w-full grid grid-cols-3 gap-4 border-l border-slate-100 pl-4">
                      {Object.entries(item.subjectStatus || {})
                        .slice(0, 3)
                        .map(([subject, stats]) => (
                          <div key={subject} className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400 truncate">
                              {subject}
                            </p>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500"
                                style={{
                                  width: `${Math.round((stats.done / stats.total) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Gaps
                        </p>
                        <p
                          className={`text-lg font-black ${item.weakTopics > 5 ? "text-red-500" : "text-slate-700"}`}
                        >
                          {item.weakTopics}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/adaptive/${item.studentId}`}
                        className="p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                No matching students found in current filter
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Subcomponents
function StatMini({ label, value, color }) {
  return (
    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm min-w-[140px]">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
        {label}
      </p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function getProgressColor(val) {
  if (val < 40) return "text-red-500";
  if (val < 70) return "text-amber-500";
  return "text-emerald-600";
}

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC] flex-col gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
        Synchronizing Academic Heartbeat...
      </p>
    </div>
  );
}
