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
  ShieldAlert,
  Lock,
  Unlock,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useSession } from "next-auth/react";

export default function AcademicYearSettings() {
  const [year, setYear] = useState("2025-2026");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // For button state
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ type: null, msg: "" });

  // 1. Fetch data from Database
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/system/academic-year");
      const data = await res.json();
      if (res.ok) {
        setYear(data.activeAcademicYear);
        setIsMaintenance(data.isMaintenanceMode);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  async function saveYear() {
    if (!/^\d{4}-\d{4}$/.test(year)) {
      setStatus({ type: "error", msg: "Format must be YYYY-YYYY" });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, msg: "" });

    try {
      const res = await fetch("/api/system/academic-year", {
        method: "POST",
        body: JSON.stringify({ year, isMaintenanceMode: isMaintenance }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update");

      setStatus({ type: "success", msg: "System synchronized successfully." });

      // Refresh history after saving
      fetchSettings();
    } catch (err) {
      setStatus({ type: "error", msg: "Server error. Check connectivity." });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        {/* Main Config Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg">
                <Calendar size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  System Context
                </h1>
                <p className="text-gray-400 text-sm">
                  Global Academic Settings
                </p>
              </div>
            </div>

            {/* Maintenance Badge */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isMaintenance
                  ? "bg-red-500/10 border-red-500/50 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              }`}
            >
              {isMaintenance ? <Lock size={16} /> : <Unlock size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isMaintenance ? "System Locked" : "System Live"}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Maintenance Toggle Section */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all ${
                isMaintenance
                  ? "bg-red-50 border-red-100"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div
                    className={`p-2 rounded-lg ${isMaintenance ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Maintenance Mode
                    </h4>
                    <p className="text-xs text-gray-500">
                      Redirect non-admins to a standby page
                    </p>
                  </div>
                </div>

                {/* Switch Component */}
                <button
                  onClick={() => setIsMaintenance(!isMaintenance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isMaintenance ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isMaintenance ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Academic Year Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">
                Active Session
              </label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-xl font-black focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="2025-2026"
              />
            </div>

            {status.type && (
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${
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
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={22} />
              )}
              {isLoading ? "Synchronizing Database..." : "Apply System Changes"}
            </button>
          </div>
        </div>

        {/* History Table ... (Keep previous table code here) */}
        {/* History Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <History size={18} className="text-gray-400" />
            <h2 className="text-sm font-black uppercase text-gray-500 tracking-widest">
              Audit Logs
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
                  {history.length > 0 ? (
                    history.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 line-through">
                              {log.oldValue}
                            </span>
                            <span className="text-xs text-gray-300">→</span>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                              {log.newValue}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User size={10} className="text-indigo-600" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-700">
                              {log.performedBy}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-gray-400 text-sm italic"
                      >
                        No transition history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
