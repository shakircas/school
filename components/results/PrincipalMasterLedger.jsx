"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Trophy,
  User,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Users,
} from "lucide-react";

const printStyles = `
  @media print {
    @page { size: A4; margin: 10mm; }
    body * { visibility: hidden; }
    #section-to-print, #section-to-print * { visibility: visible; }
    #section-to-print { position: absolute; left: 0; top: 0; width: 100%; }
    .page-break { page-break-after: always; border-bottom: 2px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px; }
  }
`;

export function PrincipalMasterLedger({
  results = [],
  classes = [],
  exams = [],
}) {
  // --- 1. STATE WITH LOCAL STORAGE PERSISTENCE ---

  // Lazy initialization to avoid SSR issues and read saved filters
  const [selectedClass, setSelectedClass] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ledger_class") || "all";
    }
    return "all";
  });

  const [selectedExam, setSelectedExam] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ledger_exam") || "all";
    }
    return "all";
  });

  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ledger_sort") || "rank";
    }
    return "rank";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentResult, setSelectedStudentResult] = useState(null);

  // Sync state to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ledger_class", selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    localStorage.setItem("ledger_exam", selectedExam);
  }, [selectedExam]);

  useEffect(() => {
    localStorage.setItem("ledger_sort", sortBy);
  }, [sortBy]);

  // --- 2. LOGIC: DATA TRANSFORMATION ---
  const processedData = useMemo(() => {
    let filtered = results.filter((res) => {
      const matchClass =
        selectedClass === "all" ||
        res.classId?._id === selectedClass ||
        res.classId === selectedClass;
      const matchExam =
        selectedExam === "all" ||
        res.exam?._id === selectedExam ||
        res.exam === selectedExam;
      const matchSearch =
        res.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.student?.rollNumber?.includes(searchQuery);
      return matchClass && matchExam && matchSearch;
    });

    const mapped = filtered.map((r) => {
      const totalMax =
        r.subjects?.reduce((acc, s) => acc + (s.totalMarks || 0), 0) || 0;
      const totalObtained =
        r.subjects?.reduce((acc, s) => acc + (s.obtainedMarks || 0), 0) || 0;
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      const isFailed = r.subjects?.some(
        (s) => s.obtainedMarks / s.totalMarks < 0.33,
      );

      return {
        ...r,
        calculatedPerc: percentage,
        calculatedObtained: totalObtained,
        totalMax,
        status: isFailed ? "Failed" : "Passed",
      };
    });

    return mapped.sort((a, b) => {
      if (sortBy === "rank") return b.calculatedPerc - a.calculatedPerc;
      if (sortBy === "rollNumber")
        return (a.student?.rollNumber || "").localeCompare(
          b.student?.rollNumber || "",
        );
      return (a.student?.name || "").localeCompare(b.student?.name || "");
    });
  }, [results, selectedClass, selectedExam, searchQuery, sortBy]);

  // --- 3. LOGIC: ANALYTICS ---
  const stats = useMemo(() => {
    if (processedData.length === 0) return null;
    const avg =
      processedData.reduce((acc, curr) => acc + curr.calculatedPerc, 0) /
      processedData.length;
    const passCount = processedData.filter((r) => r.status === "Passed").length;
    const topScorer = processedData[0];
    const atRisk = processedData.filter((r) => r.calculatedPerc < 40).length;

    return {
      avg,
      passCount,
      passRate: (passCount / processedData.length) * 100,
      topScorer,
      atRisk,
    };
  }, [processedData]);

  const allSubjectNames = useMemo(() => {
    const subjects = new Set();
    results.forEach((res) =>
      res.subjects?.forEach((s) => subjects.add(s.subject)),
    );
    return Array.from(subjects);
  }, [results]);

  const getGradeColor = (perc) => {
    if (perc >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (perc >= 60) return "text-blue-600 bg-blue-50 border-blue-100";
    if (perc >= 40) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedExam("all");
    setSortBy("rank");
    setSearchQuery("");
  };

  const handleExport = () => {
    // 1. Prepare the data rows
    const exportData = processedData.map((res) => {
      // Basic student info
      const row = {
        "Roll Number": res.student?.rollNumber,
        "Student Name": res.student?.name?.toUpperCase(),
      };

      // Add subject columns dynamically
      allSubjectNames.forEach((subjName) => {
        const score = res.subjects?.find((s) => s.subject === subjName);
        row[subjName] = score?.obtainedMarks ?? 0;
      });

      // Add totals and percentage
      row["Total Obtained"] = res.calculatedObtained;
      row["Total Marks"] = res.totalMax;
      row["Percentage"] = `${res.calculatedPerc.toFixed(2)}%`;
      row["Result Status"] = res.status;

      return row;
    });

    // 2. Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Ledger");

    // 3. Define filename based on filters
    const className =
      classes.find((c) => c._id === selectedClass)?.name || "All_Classes";
    const fileName = `Ledger_${className}_${new Date().toISOString().split("T")[0]}.xlsx`;

    // 4. Trigger download
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6 p-2 md:p-6 bg-slate-50 min-h-screen">
      <style>{printStyles}</style>
      {/* 1. ANALYTICS HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Class Average"
          value={`${stats?.avg.toFixed(1) || 0}%`}
          icon={<TrendingUp className="text-blue-500" />}
          description="Mean performance of selected group"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats?.passRate.toFixed(1) || 0}%`}
          icon={<Users className="text-emerald-500" />}
          description={`${stats?.passCount || 0} students passed`}
        />
        <StatCard
          title="At Risk"
          value={stats?.atRisk || 0}
          icon={<AlertCircle className="text-red-500" />}
          description="Students scoring below 40%"
        />
        <StatCard
          title="Top Performer"
          value={stats?.topScorer?.student?.name?.split(" ")[0] || "N/A"}
          icon={<Trophy className="text-amber-500" />}
          description={`Leading with ${stats?.topScorer?.calculatedPerc.toFixed(1) || 0}%`}
        />
      </div>

      {/* 2. MAIN LEDGER CARD */}
      <Card className="shadow-xl border-none overflow-hidden">
        <CardHeader className="bg-white border-b space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg shadow-slate-200">
                <FileSpreadsheet className="text-white h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Master Academic Ledger
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Session 2025-2026 • Live Data
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-slate-500 hover:text-red-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Printer className="h-4 w-4 mr-2" /> Bulk Print (
                {processedData.length})
              </Button>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                size="sm"
                onClick={handleExport} // Add this line
              >
                <Download className="h-4 w-4 mr-2" /> Export Excel
              </Button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <FilterSelect
              label="Class"
              value={selectedClass}
              onChange={setSelectedClass}
              options={classes}
              placeholder="All Classes"
            />
            <FilterSelect
              label="Exam"
              value={selectedExam}
              onChange={setSelectedExam}
              options={exams}
              placeholder="All Exams"
            />
            <FilterSelect
              label="Sort"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { _id: "rank", name: "Rank" },
                { _id: "rollNumber", name: "Roll No" },
                { _id: "name", name: "Name" },
              ]}
            />
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search student identity..."
                className="pl-9 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="overflow-x-auto relative">
            <Table className="border-collapse">
              <TableHeader className="bg-slate-100/80 backdrop-blur-sm sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                  <TableHead className="w-[100px] font-bold text-slate-700 sticky left-0 bg-slate-100 z-20 border-r">
                    Roll No
                  </TableHead>
                  <TableHead className="w-[220px] font-bold text-slate-700 sticky left-[100px] bg-slate-100 z-20 border-r">
                    Student Name
                  </TableHead>
                  {allSubjectNames.map((subj) => (
                    <TableHead
                      key={subj}
                      className="text-center font-semibold text-slate-600 border-r min-w-[90px] text-[10px] uppercase tracking-wider"
                    >
                      {subj}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold text-slate-900 bg-slate-200/50 border-r">
                    Obtained
                  </TableHead>
                  <TableHead className="text-center font-bold text-slate-900 bg-slate-200/50">
                    Result
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.map((res) => (
                  <TableRow
                    key={res._id}
                    className="group hover:bg-indigo-50/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs border-r sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                      {res.student?.rollNumber}
                    </TableCell>
                    <TableCell
                      className="font-semibold text-slate-800 border-r sticky left-[100px] bg-white group-hover:bg-slate-50 z-10 cursor-pointer"
                      onClick={() => setSelectedStudentResult(res)}
                    >
                      <div className="flex uppercase items-center justify-between">
                        {res.student?.name}
                        <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </TableCell>
                    {allSubjectNames.map((subjName) => {
                      const subject = res.subjects?.find(
                        (s) => s.subject === subjName,
                      );
                      const isFail =
                        subject?.obtainedMarks / subject?.totalMarks < 0.33;
                      return (
                        <TableCell
                          key={subjName}
                          className={`text-center border-r font-medium ${isFail ? "text-red-500 bg-red-50/30" : "text-slate-600"}`}
                        >
                          {subject?.obtainedMarks ?? "-"}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold text-slate-900 bg-slate-50/50 border-r">
                      {res.calculatedObtained}
                    </TableCell>
                    <TableCell className="text-center bg-slate-50/50 p-1">
                      <Badge
                        className={`rounded-md px-2 py-0.5 text-[10px] uppercase ${getGradeColor(res.calculatedPerc)}`}
                      >
                        {res.calculatedPerc.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 3. STUDENT DETAIL SHEET */}
      <Sheet
        open={!!selectedStudentResult}
        onOpenChange={() => setSelectedStudentResult(null)}
      >
        <SheetContent className="w-full p-4 sm:max-w-lg overflow-y-auto border-l-4 border-indigo-500">
          {selectedStudentResult && (
            <div className="space-y-8 pt-4">
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <User size={28} />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-black">
                      {selectedStudentResult.student?.name}
                    </SheetTitle>
                    <p className="text-indigo-600 font-medium tracking-wide">
                      ROLL # {selectedStudentResult.student?.rollNumber}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 rounded-2xl text-white">
                  <p className="text-[10px] uppercase opacity-60 font-bold">
                    Aggregate Score
                  </p>
                  <p className="text-3xl font-black">
                    {selectedStudentResult.calculatedPerc.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] uppercase text-indigo-400 font-bold">
                    School Rank
                  </p>
                  <p className="text-3xl font-black text-indigo-700">
                    #
                    {processedData.findIndex(
                      (r) => r._id === selectedStudentResult._id,
                    ) + 1}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileSpreadsheet size={14} /> Subject Analysis
                </h4>
                {selectedStudentResult.subjects?.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-all shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{s.subject}</p>
                      <p className="text-xs text-slate-400">Term Assessment</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">
                        {s.obtainedMarks} / {s.totalMarks}
                      </p>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full transition-all ${s.obtainedMarks / s.totalMarks > 0.33 ? "bg-indigo-500" : "bg-red-500"}`}
                          style={{
                            width: `${(s.obtainedMarks / s.totalMarks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full h-12 bg-slate-900 text-white rounded-xl shadow-lg">
                <Printer className="mr-2 h-4 w-4" /> Print Marksheet
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 4. HIDDEN PRINT SECTION (Only visible to printer) */}
      <div id="section-to-print" className="hidden print:block text-black">
        {processedData.map((res, index) => (
          <div
            key={res._id}
            className="page-break p-8 bg-white border-2 border-slate-900 rounded-lg"
          >
            {/* Board Header Style */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-2xl font-black uppercase">
                Academic Progress Report
              </h1>
              <p className="text-sm font-bold">Session 2025-2026</p>
            </div>

            {/* Student Bio */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-md border border-slate-200">
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold">
                  Student Name
                </p>
                <p className="text-lg font-black uppercase">
                  {res.student?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 font-bold">
                  Roll Number
                </p>
                <p className="text-lg font-mono font-bold">
                  {res.student?.rollNumber}
                </p>
              </div>
            </div>

            {/* Marks Table */}
            <table className="w-full border-collapse border-2 border-slate-900 mb-8">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="border border-slate-900 p-2 text-left">
                    Subject
                  </th>
                  <th className="border border-slate-900 p-2 text-center">
                    Total
                  </th>
                  <th className="border border-slate-900 p-2 text-center">
                    Obtained
                  </th>
                  <th className="border border-slate-900 p-2 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {res.subjects?.map((s, i) => (
                  <tr key={i} className="border-b border-slate-300">
                    <td className="p-2 font-bold">{s.subject}</td>
                    <td className="p-2 text-center">{s.totalMarks}</td>
                    <td className="p-2 text-center font-bold">
                      {s.obtainedMarks}
                    </td>
                    <td className="p-2 text-center text-xs">
                      {s.obtainedMarks / s.totalMarks >= 0.33 ? "PASS" : "FAIL"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-black">
                  <td className="p-2 border-t-2 border-slate-900">
                    GRAND TOTAL
                  </td>
                  <td className="p-2 border-t-2 border-slate-900 text-center">
                    {res.totalMax}
                  </td>
                  <td className="p-2 border-t-2 border-slate-900 text-center">
                    {res.calculatedObtained}
                  </td>
                  <td className="p-2 border-t-2 border-slate-900 text-center">
                    {res.calculatedPerc.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Footer Signatures */}
            <div className="flex justify-between mt-20 px-4">
              <div className="text-center border-t border-slate-900 pt-2 w-40">
                <p className="text-xs font-bold">Class Teacher</p>
              </div>
              <div className="text-center border-t border-slate-900 pt-2 w-40">
                <p className="text-xs font-bold">Principal Signature</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, description }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-slate-50 border-slate-200 h-10 font-medium">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder || "All"}</SelectItem>
          {options?.map((opt) => (
            <SelectItem key={opt._id} value={opt._id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
