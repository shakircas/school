"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Plus,
  Printer,
  FileSpreadsheet,
  Trophy,
  TrendingUp,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ResultsFiltersBar } from "@/components/results/results-filters-bar";
import { ResultsTable } from "@/components/results/results-table";
import AddResultDialogue from "./add-result-dialogue";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ResultsPage() {
  const [open, setOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [filters, setFilters] = useState({
    examId: "",
    classId: "",
    sectionId: "",
    student: "",
  });

  const resultsUrl = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return `/api/results?${params.toString()}`;
  }, [filters]);

  const { data: results = [], mutate } = useSWR(resultsUrl, fetcher);
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];

  // --- ACTIONS ---
  const handleExportExcel = () => {
    if (results.length === 0) return toast.error("No data to export");
    const data = results.map((r) => ({
      Roll: r.student?.rollNumber,
      Student: r.student?.name,
      Class: r.classId?.name,
      Exam: r.exam?.name,
      Percentage: `${r.percentage}%`,
      Grade: r.grade,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "Student_Results_Report.xlsx");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch("/api/results", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      toast.success("Result deleted successfully");
      mutate();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* PRINT STYLES */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            @page { size: landscape; margin: 10mm; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white; font-family: 'Inter', sans-serif; }
            .card { border: none !important; box-shadow: none !important; }
          }
        `,
          }}
        />

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Academic Analytics
            </h1>
            <p className="text-slate-500 font-medium">
              Head of School Dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-indigo-600 text-indigo-700 hover:bg-indigo-50"
            >
              <Printer className="mr-2 h-4 w-4" /> Print PDF
            </Button>
            <Button
              onClick={() => {
                setEditingResult(null);
                setOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Result
            </Button>
          </div>
        </div>

        {/* INSIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          <StatsCard
            title="Pass Percentage"
            value={`${((results.filter((r) => r.status === "Pass").length / results.length) * 100 || 0).toFixed(1)}%`}
            icon={<TrendingUp className="text-green-500" />}
          />
          <StatsCard
            title="Top Performer"
            value={
              results.sort((a, b) => b.percentage - a.percentage)[0]?.student
                ?.name || "N/A"
            }
            icon={<Trophy className="text-yellow-500" />}
          />
          <StatsCard
            title="Total Students"
            value={results.length}
            icon={<Plus className="text-indigo-500" />}
          />
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b no-print">
            <ResultsFiltersBar
              exams={exams}
              classes={classes}
              filters={filters}
              setFilters={setFilters}
            />
          </CardHeader>
          <CardContent className="p-0">
            <ResultsTable
              results={results}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        <AddResultDialogue
          open={open}
          setOpen={setOpen}
          mutate={mutate}
          editingData={editingResult}
          exams={exams}
          classes={classes}
        />
      </div>
    </MainLayout>
  );
}

function StatsCard({ title, value, icon }) {
  return (
    <Card className="flex items-center p-4 space-x-4">
      <div className="p-3 bg-slate-100 rounded-full">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-xl font-bold text-slate-900">{value}</h3>
      </div>
    </Card>
  );
}
