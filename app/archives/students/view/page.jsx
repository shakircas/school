"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  RotateCcw,
  Search,
  Users,
  Database,
  Loader2,
  ChevronRight,
  ArchiveRestore,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArchiveSummary } from "../../ArchiveSummary";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ArchivedStudentsView() {
  const [graduationYear, setGraduationYear] = useState("2025-2026");
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track specific student restore
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch actual classes from DB
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];

  async function fetchStudents() {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/archive/students/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graduationYear, classId }),
      });
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, [graduationYear, classId]);

  async function handleRestore(studentId = null) {
    const isBulk = !studentId;
    const msg = isBulk
      ? "Restore ALL students in this list to the active database?"
      : "Restore this specific student?";

    if (!confirm(msg)) return;

    setActionLoading(studentId || "bulk");
    try {
      const res = await fetch("/api/archive/students/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graduationYear, classId, studentId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchStudents(); // Refresh list
      }
    } catch (err) {
      alert("Restore failed");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.includes(searchTerm),
  );

  const exportToCSV = () => {
    if (students.length === 0) return;

    // Define headers
    const headers = [
      "Student Name",
      "Roll Number",
      "Class ID",
      "Section",
      "Archived At",
    ];

    // Map data to rows
    const rows = students.map((s) => [
      s.name,
      s.rollNumber,
      s.lastClassId,
      s.sectionId || "N/A",
      new Date(s.archivedAt).toLocaleDateString(),
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Archive_${graduationYear}_Class_${classId}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ArchiveRestore className="text-indigo-600" /> Archive Explorer
            </h1>
            <p className="text-slate-500 text-sm">
              View and restore students from cold storage collections.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={students.length === 0}
              className="flex-1 md:flex-none border-slate-300 text-slate-600"
            >
              <FileSpreadsheet size={16} className="mr-2" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              // onClick={restoreAll}
              disabled={!classId || students.length === 0 || actionLoading}
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => handleRestore()}
            >
              {actionLoading === "bulk" ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <RotateCcw size={16} className="mr-2" />
              )}
              Restore Entire Batch
            </Button>
          </div>
        </div>
        {/* Filters */}
        <Card className="bg-slate-50/50">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Graduation Cycle
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full border rounded-md p-2 bg-white"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Archived Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full border rounded-md p-2 bg-white"
              >
                <option value="">Select Class...</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Quick Search
              </label>
              <div className="relative">
                <Search
                  className="absolute left-2 top-2.5 text-slate-400"
                  size={16}
                />
                <Input
                  placeholder="Name or Roll No..."
                  className="pl-8 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <ArchiveSummary />

        {/* Results Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Student Identity</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Section</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-500" />
                    <p className="mt-2 text-slate-400">
                      Searching archive collections...
                    </p>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{s.name}</div>
                      <div className="text-[10px] text-slate-400">
                        ID: {s._id}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-indigo-600 font-medium">
                      {s.rollNumber}
                    </td>
                    <td className="p-4 text-slate-500">
                      {s.sectionId || "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        disabled={actionLoading}
                        onClick={() => handleRestore(s._id)}
                      >
                        {actionLoading === s._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw size={14} className="mr-1" /> Restore
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-12 text-center text-slate-400 italic"
                  >
                    {classId
                      ? "No archived records found for this criteria."
                      : "Select a class to begin searching."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
