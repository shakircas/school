"use client";

import { useState, useRef, useMemo, useEffect } from "react";
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
import { Printer, GraduationCap, ShieldCheck, Award } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function DMCContent() {
  const dmcRef = useRef(null);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [studentId, setStudentId] = useState("A");

  /* ---------------- API ---------------- */
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const studentsUrl = classId
    ? `/api/students?classId=${classId}&sectionId=${sectionId}`
    : null;
  const { data: studentsRes } = useSWR(studentsUrl, fetcher);

 

  const resultsUrl = useMemo(() => {
    if (!examId || !classId) return null;
    return `/api/results?examId=${examId}&classId=${classId}&sectionId=${sectionId}`;
  }, [examId, classId, sectionId]);

  const { data: results } = useSWR(resultsUrl, fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];
  const students = studentsRes?.students || [];

  const result = useMemo(() => {
    if (!results || !studentId) return null;
    return Array.isArray(results)
      ? results.find((r) => r.student?._id === studentId)
      : null;
  }, [results, studentId]);

  const exam = exams.find((e) => e._id === examId);
  const subjects = result?.subjects || [];

  /* ---------------- Grade Helper ---------------- */
  const getGrade = (p) => {
    if (p >= 90) return { grade: "A+", color: "#16a34a" };
    if (p >= 80) return { grade: "A", color: "#22c55e" };
    if (p >= 70) return { grade: "B", color: "#3b82f6" };
    if (p >= 60) return { grade: "C", color: "#eab308" };
    if (p >= 50) return { grade: "D", color: "#f97316" };
    return { grade: "F", color: "#dc2626" };
  };

  const percentage = result?.percentage || 0;
  const overallGrade = getGrade(percentage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Result Center"
        description="Generate and Print Student DMC"
      >
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
          onClick={handlePrint}
          disabled={!result}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print A4 Certificate
        </Button>
      </PageHeader>

      {/* ---------------- Selection Controls ---------------- */}
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="grid md:grid-cols-4 gap-4 pt-6">
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

          <Select value={classId} onValueChange={setClassId} disabled={!examId}>
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

          <Select
            value={sectionId}
            onValueChange={setSectionId}
            // disabled={!classId}
            defaultValue="A"
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {classes
                .find((c) => c._id === classId)
                ?.sections?.map((s) => (
                  <SelectItem key={s._id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={studentId}
            onValueChange={setStudentId}
            disabled={!sectionId}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ---------------- THE DMC (A4 PRINT READY) ---------------- */}
      {result ? (
        <div className="flex justify-center pb-10">
          <div
            ref={dmcRef}
            className="dmc-print-area bg-white shadow-2xl print:shadow-none relative overflow-hidden"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "15mm",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Border Accents */}
            <div className="absolute inset-4 border border-slate-200 pointer-events-none" />
            <div className="absolute inset-6 border-[3px] border-double border-slate-900 pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
                    EduManage
                  </h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Excellence in Education
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-4 py-1 text-sm font-bold uppercase tracking-widest mb-2">
                  Official Transcript
                </div>
                <p className="text-xs font-bold text-slate-600">
                  ID: {result._id.slice(-10).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 uppercase underline underline-offset-8 decoration-slate-200">
                Detailed Marks Certificate
              </h2>
              <p className="mt-4 text-sm font-bold text-slate-500 italic uppercase tracking-widest">
                {exam?.name} - {result.academicYear}
              </p>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 gap-0 border-2 border-slate-900 mb-8 rounded-sm overflow-hidden">
              <div className="p-3 border-r border-b border-slate-900 flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Student Name
                </span>
                <span className="text-sm font-bold uppercase">
                  {result.student.name}
                </span>
              </div>
              <div className="p-3 border-b border-slate-900 flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Roll Number
                </span>
                <span className="text-sm font-bold uppercase">
                  {result.student.rollNumber}
                </span>
              </div>
              <div className="p-3 border-r border-slate-900 flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Class & Section
                </span>
                <span className="text-sm font-bold uppercase">
                  {result.classId.name} - {result.sectionId}
                </span>
              </div>
              <div className="p-3 flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Result Date
                </span>
                <span className="text-sm font-bold uppercase">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Marks Table */}
            <div className="mb-8">
              <Table className="border-2 border-slate-900">
                <TableHeader className="bg-slate-900">
                  <TableRow className="hover:bg-slate-900">
                    <TableHead className="text-white font-black uppercase text-[10px]">
                      Subject
                    </TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">
                      Max
                    </TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">
                      Obtained
                    </TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">
                      Grade
                    </TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s, i) => (
                    <TableRow key={i} className="border-b border-slate-900">
                      <TableCell className="font-bold py-3 uppercase text-xs">
                        {s.subject}
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-600">
                        {s.totalMarks}
                      </TableCell>
                      <TableCell className="text-center font-black text-sm">
                        {s.obtainedMarks}
                      </TableCell>
                      <TableCell className="text-center font-black">
                        <span style={{ color: getGrade(s.percentage).color }}>
                          {s.grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            s.obtainedMarks >= s.passingMarks
                              ? "border-green-600 text-green-600"
                              : "border-red-600 text-red-600"
                          }`}
                        >
                          {s.obtainedMarks >= s.passingMarks ? "PASS" : "FAIL"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-black">
                    <TableCell className="uppercase text-xs">
                      Aggregate Summary
                    </TableCell>
                    <TableCell className="text-center">
                      {result.totalMaxMarks}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {result.totalObtainedMarks}
                    </TableCell>
                    <TableCell
                      className="text-center text-lg"
                      style={{ color: overallGrade.color }}
                    >
                      {overallGrade.grade}
                    </TableCell>
                    <TableCell className="text-right text-lg uppercase tracking-tighter">
                      {result.status}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Performance Footer */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex gap-4">
                <div className="border-2 border-slate-900 p-3 text-center min-w-[100px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Percentage
                  </p>
                  <p className="text-xl font-black">{percentage}%</p>
                </div>
                <div className="border-2 border-slate-900 p-3 text-center min-w-[100px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Grade
                  </p>
                  <p
                    className="text-xl font-black"
                    style={{ color: overallGrade.color }}
                  >
                    {overallGrade.grade}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <QRCodeSVG value={`verify-${result._id}`} size={60} />
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                  Scan to Verify Result
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-20 grid grid-cols-3 gap-10">
              <div className="text-center">
                <div className="border-t-2 border-slate-900 pt-2 font-black uppercase text-[10px]">
                  Class Teacher
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-slate-900 pt-2 font-black uppercase text-[10px]">
                  Controller Exam
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-slate-900 pt-2 font-black uppercase text-[10px]">
                  Principal Signature
                </div>
              </div>
            </div>

            {/* Official Footer */}
            <div className="absolute bottom-10 left-0 right-0 px-10 text-center">
              <p className="text-[9px] text-slate-400 border-t pt-4">
                This is a system-generated academic record from EduManage
                Portal. Official validation requires school stamp and authorized
                signature.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Award className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-slate-400 font-medium">
            Please select filters to generate the certificate
          </p>
        </div>
      )}

      {/* ---------------- PRINT ONLY STYLES ---------------- */}
      <style jsx global>{`
        @media print {
          /* Hide everything else */
          body * {
            visibility: hidden;
          }
          /* Show only the DMC area */
          .dmc-print-area,
          .dmc-print-area * {
            visibility: visible;
          }
          .dmc-print-area {
            position: fixed; /* Use fixed for absolute positioning on the page */
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 15mm !important; /* Keep internal padding for design */
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact; /* Ensure background colors/borders print */
            print-color-adjust: exact;
          }
          /* Critical: Remove browser default margins */
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
