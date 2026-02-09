"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  CalendarClock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  DatabaseZap,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ArchiveAttendancePage() {
  const [year, setYear] = useState("2024-2025");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  console.log(year);
  async function archiveAttendance() {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/archive/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear: year }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error });
      } else {
        setStatus({ type: "success", message: data.message });
        setShowConfirm(false);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "Network error occurred. Check DB connection.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="bg-red-100 p-3 rounded-xl">
            <DatabaseZap className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Attendance Cold Storage
            </h1>
            <p className="text-slate-500 text-sm">
              Transfer high-volume attendance logs to archive collections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Action Card */}
          <Card className="md:col-span-2 overflow-hidden border-red-100 shadow-sm">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg">Archive Configuration</CardTitle>
              <CardDescription>
                Select the academic cycle to lock and archive.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Target Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border-2 border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-red-500 transition-all outline-none bg-white"
                  disabled={loading}
                >
                  <option value="2023-2024">2023-2024 (Past)</option>
                  <option value="2024-2025">2024-2025 (Past)</option>
                  <option value="2025-2026">2025-2026 (Current)</option>
                </select>
              </div>

              {!showConfirm ? (
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold"
                  disabled={loading || status.type === "success"}
                >
                  <CalendarClock className="mr-2 h-5 w-5" />
                  Initialize Archiving
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-red-50 rounded-xl border border-red-200 animate-in zoom-in-95">
                  <p className="text-red-700 text-sm font-bold flex items-center gap-2">
                    <ShieldAlert size={18} /> Are you absolutely sure?
                  </p>
                  <p className="text-xs text-red-600">
                    This will delete all daily attendance records for {year}{" "}
                    from the live dashboard and move them to
                    <code className="bg-white px-1 mx-1 rounded border">
                      attendances_{year.replace("-", "_")}
                    </code>
                    .
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={archiveAttendance}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Confirm Archive"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {status.message && (
                <Alert
                  variant={
                    status.type === "success" ? "default" : "destructive"
                  }
                  className={
                    status.type === "success"
                      ? "border-green-200 bg-green-50"
                      : ""
                  }
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {status.type === "success" ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>{status.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
                  <History size={16} /> Data Lifecycle
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-amber-700 leading-relaxed">
                Archiving moves records out of the <b>Attendance</b> collection.
                This keeps your "Mark Attendance" screens fast and responsive.
                Historical reports will pull from the archive collections
                automatically.
              </CardContent>
            </Card>

            <div className="p-4 border rounded-xl bg-white shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">
                Archive Status
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span>Database Load</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  Optimal
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Cloud Storage</span>
                <span className="font-mono text-slate-400">72% Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
