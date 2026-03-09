"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  History,
  User,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function AcademicYearSettings() {
  const [year, setYear] = useState("2024-2025");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      id: 1,
      oldYear: "2023-2024",
      newYear: "2024-2025",
      date: "2024-08-15",
      user: "Admin_Sarah",
    },
    {
      id: 2,
      oldYear: "2022-2023",
      newYear: "2023-2024",
      date: "2023-08-20",
      user: "Admin_John",
    },
  ]);
  const [status, setStatus] = useState({ type: null, msg: "" });

  async function saveYear() {
    if (!/^\d{4}-\d{4}$/.test(year)) {
      setStatus({
        type: "error",
        msg: "Format must be YYYY-YYYY (e.g., 2025-2026)",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      const res = await fetch("/api/system/academic-year", {
        method: "POST",
        body: JSON.stringify({ year }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update");

      // Mocking history update - in production, you'd re-fetch this from the API
      const newEntry = {
        id: Date.now(),
        oldYear: history[0]?.newYear || "Unknown",
        newYear: year,
        date: new Date().toISOString().split("T")[0],
        user: "Current_Admin",
      };
      setHistory([newEntry, ...history]);

      setStatus({
        type: "success",
        msg: "System-wide academic year updated successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        msg: "Server error. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        {/* Configuration Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="bg-gray-900 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Calendar size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  Academic Year
                </h1>
                <p className="text-gray-400 text-sm font-medium">
                  Control the global active context
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-2xl flex gap-4">
              <AlertCircle className="text-blue-600 shrink-0" size={24} />
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                Updating this value re-indexes student performance data for the
                selected session. Ensure all results for the previous year are
                finalized before proceeding.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">
                Set Active Session
              </label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-xl font-black focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                placeholder="2025-2026"
              />
            </div>

            {status.type && (
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                {status.msg}
              </div>
            )}

            <button
              onClick={saveYear}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={22} />
              )}
              {isLoading ? "Synchronizing..." : "Publish Global Update"}
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <History size={18} className="text-gray-400" />
            <h2 className="text-sm font-black uppercase text-gray-500 tracking-widest">
              Update History
            </h2>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Transition
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Authorized By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {log.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 line-through">
                            {log.oldYear}
                          </span>
                          <span className="text-xs text-gray-300">→</span>
                          <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            {log.newYear}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <User size={12} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {log.user}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
