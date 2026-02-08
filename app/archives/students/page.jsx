"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Archive, Trash2, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ArchiveStudentsPage() {
  const [graduationYear, setGraduationYear] = useState("2025-2026");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Classes to avoid hardcoding IDs
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];

  // 2. Fetch Students matching the criteria to show a preview
  const query = new URLSearchParams({
    classId,
    graduationYear, // Ensure your /api/students endpoint supports this filter
    status: "Graduated",
  });

  const { data: studentRes, isValidating } = useSWR(
    classId ? `/api/students?${query.toString()}` : null,
    fetcher,
  );
  const students = studentRes?.students || [];

  async function handleArchive() {
    if (!classId)
      return setMessage({ type: "error", text: "Please select a class" });

    const confirmFirst = confirm(
      `Are you sure? This will move ${students.length} students to a permanent archive collection.`,
    );
    if (!confirmFirst) return;

    const confirmSecond = confirm(
      "FINAL WARNING: These students will be DELETED from the main database to save space. Proceed?",
    );
    if (!confirmSecond) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/archive/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graduationYear, classId }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        toast.success(data.message);
        setClassId(""); // Reset selection
      } else {
        setMessage({ type: "error", text: data.error });
        toast.error(data.error);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed" });
      toast.error("Server connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl p-6 mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Archive className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold">Data Archiving Engine</h1>
            <p className="text-slate-500 text-sm">
              Move graduated students to cold storage to optimize Free Tier
              MongoDB performance.
            </p>
          </div>
        </div>

        <Alert variant="destructive" className="bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Archived students are removed from active lists and reports. This
            action is intended for Class 10/Graduates only.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase text-slate-500">
                Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase">
                  Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase">
                  Select Graduating Class
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Class...</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleArchive}
                disabled={loading || !classId || students.length === 0}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading
                  ? "Processing..."
                  : `Archive ${students.length} Students`}
              </Button>

              {message.text && (
                <p
                  className={`text-sm font-medium p-2 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {message.text}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase text-slate-500">
                Ready to Archive
              </CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {isValidating ? (
                  <p className="text-sm text-slate-400">Loading list...</p>
                ) : students.length > 0 ? (
                  students.map((s) => (
                    <div
                      key={s._id}
                      className="text-sm p-2 border rounded flex justify-between bg-slate-50"
                    >
                      <span>{s.name}</span>
                      <span className="font-mono text-xs text-slate-400">
                        {s.rollNumber}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No students found matching this criteria.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
