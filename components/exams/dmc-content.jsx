"use client";

import { useState, useRef, useMemo } from "react";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Download, Printer, GraduationCap } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function DMCContent() {
  const dmcRef = useRef(null);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [studentId, setStudentId] = useState("");

  /* ---------------- API ---------------- */
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const studentsUrl =
    classId && sectionId
      ? `/api/students?classId=${classId}&sectionId=${sectionId}`
      : null;

  const { data: studentsRes } = useSWR(studentsUrl, fetcher);
  const [filters, setFilters] = useState({
    examId: "",
    classId: "",
    sectionId: "",
    student: "",
  });

  const resultsUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.examId) params.append("examId", filters.examId);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.sectionId) params.append("sectionId", filters.sectionId);
    if (filters.student) params.append("student", filters.student);

    return `/api/results?${params.toString()}`;
  }, [filters]);

  const { data: results, isLoading } = useSWR(resultsUrl, fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];
  const students = studentsRes?.students || [];
  console.log(results);
  const exam = exams.find((e) => e._id === examId);

  // const result = results?.[0];
  // const subjects = result?.subjects || [];
  const result = useMemo(() => {
    if (!results || !studentId) return null;
    return results.find((r) => r.student?._id === studentId);
  }, [results, studentId]);
  const subjects = result?.subjects || [];

  /* ---------------- Grade Helper ---------------- */
  const getGrade = (p) => {
    if (p >= 90) return { grade: "A+", class: "bg-green-600 text-white" };
    if (p >= 80) return { grade: "A", class: "bg-green-500 text-white" };
    if (p >= 70) return { grade: "B", class: "bg-blue-500 text-white" };
    if (p >= 60) return { grade: "C", class: "bg-yellow-500 text-black" };
    if (p >= 50) return { grade: "D", class: "bg-orange-500 text-white" };
    return { grade: "F", class: "bg-red-600 text-white" };
  };

  /* ---------------- Totals ---------------- */
  const name = result?.student?.name || "";
  const obtainedMarks = result?.obtainedMarks || 0;
  const totalMarks = result?.totalMarks || 0;
  const percentage = result?.percentage?.toFixed(2) || 0;
  const overallGrade = getGrade(percentage);

  /* ---------------- Print ---------------- */
  const handlePrint = () => {
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`<html><body>${dmcRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detailed Mark Certificate (DMC)"
        description="Exam → Class → Section → Student"
      >
        <Button
          variant="outline"
          onClick={handlePrint}
          // disabled={!results?.length > 0}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </PageHeader>

      {/* ---------------- Selection ---------------- */}
      <Card>
        <CardContent className="grid md:grid-cols-4 gap-4 pt-6">
          {/* Exam */}
          <Select
            value={examId}
            onValueChange={(v) => {
              setExamId(v);
              setClassId("");
              setSectionId("");
              setStudentId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name} ({e.examType} - {e.academicYear} - {e.classId.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Class */}
          <Select
            value={classId}
            disabled={!examId}
            onValueChange={(v) => {
              setClassId(v);
              setSectionId("");
              setStudentId("");
            }}
          >
            <SelectTrigger>
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

          {/* Section */}
          <Select
            value={sectionId}
            disabled={!classId}
            onValueChange={(v) => {
              setSectionId(v);
              setStudentId("");
            }}
          >
            <SelectTrigger>
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

          {/* Student */}
          <Select
            value={studentId}
            disabled={!sectionId}
            onValueChange={setStudentId}
          >
            <SelectTrigger>
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

      {/* ---------------- DMC ---------------- */}

      <Card>
        <CardContent className="pt-6">
          <div ref={dmcRef} className="p-8 bg-white border rounded-lg">
            <div className="text-center mb-8">
              <GraduationCap className="mx-auto h-14 w-14 text-primary mb-2" />
              <h1 className="text-2xl font-bold">EduManage School</h1>
              <p className="text-muted-foreground">Detailed Mark Certificate</p>
              <p className="mt-2 font-semibold">{exam?.name}</p>
            </div>
            {/* ---------- Student & Exam Info ---------- */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div className="space-y-1">
                <p>
                  <strong>Student Name:</strong> {result?.student.name}
                </p>
                <p>
                  <strong>Roll No:</strong> {result?.student.rollNumber}
                </p>
                <p>
                  <strong>Class:</strong> {result?.classId.name}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <p>
                  <strong>Examination:</strong> {result?.exam?.name}
                </p>
                <p>
                  <strong>Academic Year:</strong> {result?.academicYear}
                </p>
                <p>
                  <strong>Result Status:</strong> {result?.status}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">Sr#</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Total Marks</TableHead>
                  <TableHead className="text-center">Marks Obtained</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {subjects.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell>{s.subject}</TableCell>
                    <TableCell className="text-center">
                      {s.totalMarks}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.obtainedMarks}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          getGrade(s.percentage).class
                        }`}
                      >
                        {s.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={2}>Grand Total</TableCell>
                  <TableCell className="text-center">{totalMarks}</TableCell>
                  <TableCell className="text-center">{obtainedMarks}</TableCell>
                  <TableCell className="text-center">{percentage}%</TableCell>
                  <TableCell className="text-center">
                    {overallGrade.grade}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {/* ---------- Footer ---------- */}
            <div className="mt-10 grid grid-cols-3 text-sm text-center">
              <div>
                <p className="mt-12 border-t border-black pt-2">
                  Class Teacher
                </p>
              </div>

              <div>
                <p className="mt-12 border-t border-black pt-2">
                  Controller of Examinations
                </p>
              </div>

              <div>
                <p className="mt-12 border-t border-black pt-2">Principal</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
