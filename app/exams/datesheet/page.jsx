"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays } from "lucide-react";
import { ExamDateSheet } from "@/components/exams/ExamDateSheet";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((r) => r.json());

const ExamDateSheetPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    classId: "",
    examType: "",
    academicYear: "2025-2026", // Set modern format
  });

  // 1. Construct API Query
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.classId && filters.classId !== "all")
      params.append("classId", filters.classId);
    if (filters.examType) params.append("examType", filters.examType);
    params.append("academicYear", filters.academicYear);
    return params.toString();
  }, [filters]);

  const { data: examsRes, isLoading } = useSWR(
    `/api/exams?${queryString}`,
    fetcher
  );
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const rawExams = examsRes?.data || [];
  const classes = classesRes?.data || [];

  // 2. Client-side Subject Search Logic
  // This filters the exams array to only show exams that contain the searched subject
  const filteredExams = useMemo(() => {
    if (!searchTerm) return rawExams;

    return rawExams.filter((exam) =>
      exam.schedule.some((item) =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, rawExams]);

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Date Sheets
            </h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <CalendarDays className="h-4 w-4" /> Academic Session{" "}
              {filters.academicYear}
            </p>
          </div>

          {/* Subject Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by subject (e.g. Math)..."
              className="pl-10 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md sticky top-4 z-10">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Academic Year Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Session
              </label>
              <Select
                value={filters.academicYear}
                onValueChange={(v) =>
                  setFilters((p) => ({ ...p, academicYear: v }))
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2026-2027">2026-2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Class Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Class
              </label>
              <Select
                value={filters.classId}
                onValueChange={(v) => setFilters((p) => ({ ...p, classId: v }))}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Exam Type
              </label>
              <Select
                value={filters.examType}
                onValueChange={(v) =>
                  setFilters((p) => ({ ...p, examType: v }))
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly Test</SelectItem>
                  <SelectItem value="Mid Term">Mid Term</SelectItem>
                  <SelectItem value="Final">Final Examination</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Result Display */}
        <div className="space-y-10 pb-20">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-8 w-48 bg-slate-200 rounded"></div>
                <div className="h-4 w-32 bg-slate-100 rounded"></div>
              </div>
            </div>
          ) : filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <ExamDateSheet key={exam._id} exam={exam} />
            ))
          ) : (
            <div className="text-center py-24 bg-slate-50 border-2 border-dashed rounded-3xl">
              <p className="text-slate-400 font-medium">
                No schedules match your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamDateSheetPage;
