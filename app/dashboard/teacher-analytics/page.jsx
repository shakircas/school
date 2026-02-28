"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowRight,
  AlertCircle,
  BarChart3,
  Loader2,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";

export default function TeacherAnalytics() {
  const { data, isLoading } = useSWR("/api/teacher/study-analytics", fetcher);

  if (isLoading) return <LoadingState />;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Header & Overview */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">
              <BarChart3 className="w-4 h-4" /> Academic Command Center
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              ADAPTIVE ANALYTICS
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Real-time monitoring of AI-driven recovery plans.
            </p>
          </div>

          <div className="flex gap-4">
            <StatMini
              label="Avg. Mastery"
              value="72%"
              color="text-emerald-600"
            />
            <StatMini
              label="At Risk"
              value={data?.filter((s) => s.progress < 40).length || 0}
              color="text-red-500"
            />
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid gap-6">
          {data?.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Profile Section */}
                <div className="flex items-center gap-4 min-w-[250px] w-full lg:w-auto">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 text-xl">
                    {item.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {item.studentName}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mt-1">
                      <Calendar className="w-3 h-3" /> Updated{" "}
                      {new Date(item.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Progress Chart (Overall) */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Global Recovery
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

                {/* Subject Mini-Charts (Top 3) */}
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
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{
                              width: `${Math.round((stats.done / stats.total) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Weak Topics Badge & Action */}
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
                    className="p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

// --- Subcomponents ---

function StatMini({ label, value, color }) {
  return (
    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200">
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
        Analyzing Mastery Flux...
      </p>
    </div>
  );
}
