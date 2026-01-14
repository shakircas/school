"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Download, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { StudentResultCard } from "@/components/exams/StudentResultCard";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ResultsContent() {
  const [open, setOpen] = useState(false);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");

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

  // const { data: results = [], mutate } = useSWR(resultsUrl, fetcher);

  /* ---------------- API ---------------- */
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: resultsRes, mutate } = useSWR(resultsUrl, fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const studentsUrl =
    classId && sectionId
      ? `/api/students?classId=${classId}&sectionId=${sectionId}`
      : null;

  const { data: studentsRes } = useSWR(studentsUrl, fetcher);

  const exams = examsRes?.data || [];
  const results = resultsRes || [];
  const subjects = subjectsRes?.data || [];
  const classes = classesRes?.data || [];
  const students = studentsRes?.students || [];

  /* ---------------- EXAM ---------------- */
  const exam = useMemo(
    () => exams.find((e) => e._id === examId),
    [examId, exams]
  );

  /* Sync class & section from exam */
  useEffect(() => {
    if (exam) {
      setClassId(exam.classId);
      setSectionId(exam.sectionId);
    } else {
      setClassId("");
      setSectionId("");
    }
  }, [exam]);

  

  const exportResults = async () => {
    try {
      const response = await fetch(
        `/api/results?export=csv&class=${selectedClass}&exam=${selectedExam}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "results.csv";
      a.click();
      toast.success("Results exported successfully");
    } catch (error) {
      toast.error("Failed to export results");
    }
  };

  const getGradeBadge = (percentage) => {
    if (percentage >= 90) return <Badge className="bg-green-500">A+</Badge>;
    if (percentage >= 80) return <Badge className="bg-green-400">A</Badge>;
    if (percentage >= 70) return <Badge className="bg-blue-500">B</Badge>;
    if (percentage >= 60) return <Badge className="bg-yellow-500">C</Badge>;
    if (percentage >= 50) return <Badge className="bg-orange-500">D</Badge>;
    return <Badge variant="destructive">F</Badge>;
  };

  /* ---------------- UI ---------------- */
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Exam Results</h2>
            <p className="text-muted-foreground">
              Exam → Class → Section → Student → Subjects
            </p>
          </div>
         
          <Button variant="outline" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export{" "}
          </Button>
        </div>

        

        {/* Filter result */}
        <Card>
          <CardContent className="grid md:grid-cols-5 gap-3">
            <Select
              value={filters.examId}
              onValueChange={(v) => setFilters((p) => ({ ...p, examId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name} ({e.examType} - {e.academicYear} -{" "}
                    {e.classId?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.classId}
              onValueChange={(v) => setFilters((p) => ({ ...p, classId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search student / roll"
              value={filters.student}
              onChange={(e) =>
                setFilters((p) => ({ ...p, student: e.target.value }))
              }
            />

            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  examId: "",
                  classId: "",
                  sectionId: "",
                  student: "",
                })
              }
            >
              Reset
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
          {results.map((r) => (
            <StudentResultCard key={r._id} result={r} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
