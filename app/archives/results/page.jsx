"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Archive,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  FileDown,
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

export default function ArchiveResultsPage() {
  const [year, setYear] = useState("2024-2025");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [lastArchived, setLastArchived] = useState(null);

  // Function to generate and download the audit CSV
  const downloadAuditLog = (yearValue, message) => {
    const timestamp = new Date().toLocaleString();
    const headers = ["Attribute", "Details"];
    const data = [
      ["Operation", "Results Archiving"],
      ["Academic Year", yearValue],
      ["Status", "Success"],
      ["Archive Collection", `results_archive_${yearValue.replace("-", "_")}`],
      ["Timestamp", timestamp],
      ["Server Message", message],
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Archive_Audit_${yearValue}_${Date.now()}.csv`,
    );
    link.click();
  };

  async function archiveResults() {
    if (
      !confirm(
        `Confirm: Move all ${year} results to cold storage? This cannot be undone from this panel.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/archive/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicYear: year }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Archiving failed");

      setStatus({ type: "success", message: data.message });
      setLastArchived(year);

      // Automatically trigger the audit log download
      downloadAuditLog(year, data.message);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Archive className="text-red-600 h-8 w-8" />
            Results Archiving
          </h1>
          <p className="text-slate-500">
            Optimize live database performance by moving historical results to
            cold storage.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <Database size={18} /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-4">
                <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-900 uppercase">
                    Warning
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    This process deletes data from the{" "}
                    <strong>active results table</strong>. An audit CSV will be
                    generated automatically for your records.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Academic Year
                  </label>
                  <Select onValueChange={setYear} defaultValue={year}>
                    <SelectTrigger className="h-12 border-2 focus:ring-red-500">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023-2024</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={archiveResults}
                  disabled={loading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Moving Data...
                    </>
                  ) : (
                    <>
                      Start Archive Process{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {status.message && (
            <Alert
              className={`animate-in fade-in slide-in-from-top-2 border-2 ${
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
              <AlertTitle className="font-bold flex justify-between items-center">
                {status.type === "success" ? "Success" : "Error"}
                {status.type === "success" && (
                  <span className="text-[10px] bg-green-200 px-2 py-1 rounded text-green-900">
                    Audit Saved
                  </span>
                )}
              </AlertTitle>
              <AlertDescription className="flex justify-between items-end">
                <span>{status.message}</span>
                {status.type === "success" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      downloadAuditLog(lastArchived, status.message)
                    }
                    className="h-7 text-[10px] hover:bg-green-100 underline decoration-green-400"
                  >
                    <FileDown size={12} className="mr-1" /> Re-download Log
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
