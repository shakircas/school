"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  FileText,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  FileDown,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ArchiveExamsPage() {
  const [year, setYear] = useState("2024-2025");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const downloadExamAudit = (yearValue, message) => {
    const timestamp = new Date().toLocaleString();
    const csvContent = [
      ["Audit Report", "Exam Archiving System"],
      ["Academic Year", yearValue],
      ["Status", "Archived Successfully"],
      ["Archive Table", `exams_archive_${yearValue.replace("-", "_")}`],
      ["Timestamp", timestamp],
      ["System Message", message],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Exam_Archive_Log_${yearValue}.csv`);
    link.click();
  };

  async function handleArchive() {
    if (
      !confirm(
        `CAUTION: You are about to remove ALL exam configurations and schedules for ${year} from the live system. Continue?`,
      )
    ) {
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/archive/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear: year }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Archiving failed");

      setStatus({ type: "success", message: data.message });
      downloadExamAudit(year, data.message);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-2xl text-red-600 mb-2">
            <FileText size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Exam Records Archiving
          </h1>
          <p className="text-slate-500">
            Move exam schedules and metadata to cold storage collections.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border-2 border-slate-100 shadow-xl">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700 font-bold">
                <Database size={18} /> Archive Controller
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {/* Danger Alert */}
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-4">
                <ShieldAlert className="text-red-600 shrink-0" size={24} />
                <div className="space-y-1">
                  <p className="text-xs font-black text-red-900 uppercase">
                    Data Integrity Warning
                  </p>
                  <p className="text-[11px] text-red-700 leading-relaxed font-medium">
                    This action will delete all live exam data for the selected
                    year. It is highly recommended to perform this only after
                    all final grades for the session have been posted.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">
                    Select Academic Session
                  </label>
                  <Select onValueChange={setYear} defaultValue={year}>
                    <SelectTrigger className="h-12 border-2 border-slate-200 focus:ring-red-500 font-bold text-slate-700">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">
                        Academic Session 2023-2024
                      </SelectItem>
                      <SelectItem value="2024-2025">
                        Academic Session 2024-2025
                      </SelectItem>
                      <SelectItem value="2025-2026">
                        Academic Session 2025-2026
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleArchive}
                  disabled={loading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black transition-all shadow-lg active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Archiving Exams...
                    </>
                  ) : (
                    <>
                      Archive Now <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {status.message && (
            <Alert
              className={`animate-in zoom-in-95 border-2 ${
                status.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <div className="ml-2">
                <AlertTitle className="font-black text-sm">
                  {status.type === "success"
                    ? "Archive Complete"
                    : "Archive Failed"}
                </AlertTitle>
                <AlertDescription className="text-xs font-medium flex justify-between items-center mt-1">
                  {status.message}
                  {status.type === "success" && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => downloadExamAudit(year, status.message)}
                      className="h-auto p-0 text-[10px] text-green-700 font-black flex items-center gap-1"
                    >
                      <FileDown size={12} /> RE-DOWNLOAD LOG
                    </Button>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Informational Footer */}
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Inbox size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Exams cold-storage system
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
