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
import { PrincipalMasterLedger } from "@/components/results/PrincipalMasterLedger";

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
      <PrincipalMasterLedger results={results} classes={classes} exams={exams} />
    </MainLayout>
  );
}
