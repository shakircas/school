"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { PageHeader } from "@/components/ui/page-header";
import { Printer, GraduationCap, Award, Library } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function BulkDMCContent() {
  // Initialize state from localStorage if available
  const [examId, setExamId] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("bulk_dmc_exam") || ""
      : "",
  );
  const [classId, setClassId] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("bulk_dmc_class") || ""
      : "",
  );
  const [sectionId, setSectionId] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("bulk_dmc_section") || "A"
      : "A",
  );

  // Persist selections to localStorage
  useEffect(() => {
    localStorage.setItem("bulk_dmc_exam", examId);
    localStorage.setItem("bulk_dmc_class", classId);
    localStorage.setItem("bulk_dmc_section", sectionId);
  }, [examId, classId, sectionId]);

  /* ---------------- API ---------------- */
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const resultsUrl = useMemo(() => {
    if (!examId || !classId) return null;
    return `/api/results?examId=${examId}&classId=${classId}&sectionId=${sectionId}`;
  }, [examId, classId, sectionId]);

  const { data: results, isLoading } = useSWR(resultsUrl, fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];
  const activeExam = exams.find((e) => e._id === examId);

  /* ---------------- Grade Helper ---------------- */
  const getGrade = (p) => {
    if (p >= 90) return { grade: "A+", color: "#16a34a" };
    if (p >= 80) return { grade: "A", color: "#22c55e" };
    if (p >= 70) return { grade: "B", color: "#3b82f6" };
    if (p >= 60) return { grade: "C", color: "#eab308" };
    if (p >= 50) return { grade: "D", color: "#f97316" };
    return { grade: "F", color: "#dc2626" };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk DMC Generator"
        description={`Generating ${results?.length || 0} certificates for the selected class.`}
      >
        <Button
          className="bg-slate-900 hover:bg-black shadow-lg"
          onClick={() => window.print()}
          disabled={!results || results.length === 0}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print All DMCs (A4)
        </Button>
      </PageHeader>

      {/* ---------------- Selection Controls ---------------- */}
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="grid md:grid-cols-3 gap-4 pt-6">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
              <SelectItem value="C">Section C</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ---------------- THE BULK RENDER ---------------- */}
      <div className="flex flex-col items-center gap-10 pb-20">
        {results && results.length > 0 ? (
          results.map((result) => {
            const overallGrade = getGrade(result.percentage || 0);

            return (
              <div
                key={result._id}
                className="dmc-print-area bg-white shadow-2xl print:shadow-none relative overflow-hidden mb-10"
                style={{
                  width: "210mm",
                  height: "297mm",
                  padding: "15mm",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Border Accents */}
                <div className="absolute inset-4 border border-slate-200 pointer-events-none" />
                <div className="absolute inset-6 border-[3px] border-double border-slate-900 pointer-events-none" />

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                      <Library size={28} />
                    </div>
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tighter">
                        EduManage Systems
                      </h1>
                      <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                        Verified Academic Transcript
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase mb-1">
                      Official DMC
                    </div>
                    <p className="text-[9px] font-mono font-bold">
                      SN: {result._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 uppercase">
                    Detailed Marks Certificate
                  </h2>
                  <p className="text-xs font-bold text-slate-500 tracking-widest mt-1">
                    {activeExam?.name} | {result.academicYear}
                  </p>
                </div>

                {/* Student Info Box */}
                <div className="grid grid-cols-2 border-2 border-slate-900 mb-6 bg-slate-50/30">
                  <div className="p-3 border-r border-b border-slate-900">
                    <p className="text-[8px] font-black text-slate-400 uppercase">
                      Student Name
                    </p>
                    <p className="text-sm font-bold uppercase">
                      {result.student?.name}
                    </p>
                  </div>
                  <div className="p-3 border-b border-slate-900">
                    <p className="text-[8px] font-black text-slate-400 uppercase">
                      Roll Number
                    </p>
                    <p className="text-sm font-bold uppercase">
                      {result.student?.rollNumber}
                    </p>
                  </div>
                  <div className="p-3 border-r border-slate-900">
                    <p className="text-[8px] font-black text-slate-400 uppercase">
                      Class & Section
                    </p>
                    <p className="text-sm font-bold uppercase">
                      {result.classId?.name} - {result.sectionId}
                    </p>
                  </div>
                  <div className="p-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase">
                      Date of Issue
                    </p>
                    <p className="text-sm font-bold uppercase">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Marks Table */}
                <Table className="border-2 border-slate-900 mb-6">
                  <TableHeader className="bg-slate-900">
                    <TableRow className="hover:bg-slate-900 h-8">
                      <TableHead className="text-white font-bold text-[9px] uppercase">
                        Subject
                      </TableHead>
                      <TableHead className="text-white font-bold text-[9px] uppercase text-center">
                        Total
                      </TableHead>
                      <TableHead className="text-white font-bold text-[9px] uppercase text-center">
                        Obtained
                      </TableHead>
                      <TableHead className="text-white font-bold text-[9px] uppercase text-center">
                        Grade
                      </TableHead>
                      <TableHead className="text-white font-bold text-[9px] uppercase text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.subjects?.map((s, i) => (
                      <TableRow
                        key={i}
                        className="border-b border-slate-900 h-10"
                      >
                        <TableCell className="font-bold py-2 uppercase text-[11px]">
                          {s.subject}
                        </TableCell>
                        <TableCell className="text-center font-bold text-slate-500 text-xs">
                          {s.totalMarks}
                        </TableCell>
                        <TableCell className="text-center font-black text-xs">
                          {s.obtainedMarks}
                        </TableCell>
                        <TableCell
                          className="text-center font-black text-xs"
                          style={{ color: getGrade(s.percentage).color }}
                        >
                          {s.grade}
                        </TableCell>
                        <TableCell className="text-right text-[10px] font-bold">
                          {s.obtainedMarks >= s.passingMarks ? "PASS" : "FAIL"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-100 font-black border-t-2 border-slate-900">
                      <TableCell className="text-[10px] uppercase">
                        Grand Aggregate
                      </TableCell>
                      <TableCell className="text-center">
                        {result.totalMaxMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.totalObtainedMarks}
                      </TableCell>
                      <TableCell
                        className="text-center"
                        style={{ color: overallGrade.color }}
                      >
                        {overallGrade.grade}
                      </TableCell>
                      <TableCell className="text-right uppercase">
                        {result.status}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Footer and Security */}
                <div className="flex justify-between items-center mb-10">
                  <div className="flex gap-4">
                    <div className="border-2 border-slate-900 p-2 text-center min-w-[80px]">
                      <p className="text-[7px] font-black text-slate-400 uppercase">
                        Percentage
                      </p>
                      <p className="text-base font-black">
                        {result.percentage}%
                      </p>
                    </div>
                    <div className="border-2 border-slate-900 p-2 text-center min-w-[80px]">
                      <p className="text-[7px] font-black text-slate-400 uppercase">
                        Final Grade
                      </p>
                      <p
                        className="text-base font-black"
                        style={{ color: overallGrade.color }}
                      >
                        {overallGrade.grade}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <QRCodeSVG
                      value={`https://school-six-tau.vercel.app/verify/${result._id}`}
                      size={60}
                    />
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                      Scan to Verify Result
                    </p>
                  </div>
                </div>

                {/* Signature Rows */}
                <div className="mt-12 grid grid-cols-3 gap-8">
                  <div className="text-center border-t-2 border-slate-900 pt-1 font-bold uppercase text-[9px]">
                    Class Teacher
                  </div>
                  <div className="text-center border-t-2 border-slate-900 pt-1 font-bold uppercase text-[9px]">
                    Exam Controller
                  </div>
                  <div className="text-center border-t-2 border-slate-900 pt-1 font-bold uppercase text-[9px]">
                    Principal
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-64 w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-slate-50">
            <Award className="h-12 w-12 text-slate-200 mb-2" />
            <p className="text-slate-400">
              Select Exam and Class to generate bulk DMCs
            </p>
          </div>
        )}
      </div>

      {/* ---------------- PRINT ENGINE ---------------- */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .dmc-print-area,
          .dmc-print-area * {
            visibility: visible;
          }
          .dmc-print-area {
            position: relative;
            display: block !important;
            page-break-after: always !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
