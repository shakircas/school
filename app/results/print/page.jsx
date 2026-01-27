"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { MainLayout } from "@/components/layout/main-layout";
import BulkPrintView from "@/components/exams/BulkPrintView";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

const ResultCardsPrintPage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];

  // Fetch results only when filters are selected
  const queryParams = new URLSearchParams();
  if (selectedClass) queryParams.append("classId", selectedClass);
  if (selectedSection) queryParams.append("sectionId", selectedSection);
  if (selectedExam) queryParams.append("examId", selectedExam);

  const { data: resultsRes, isLoading: loadingResults } = useSWR(
    selectedClass && selectedExam
      ? `/api/results?${queryParams.toString()}`
      : null,
    fetcher,
  );

  const results = resultsRes || [];

  // Find the selected class object to get its sections
  const currentClass = classes?.find((c) => c._id === selectedClass);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* SELECTOR BAR - Hidden on Print */}
        <Card className="print:hidden border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Class Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Class
                </label>
                <Select
                  value={selectedClass}
                  onValueChange={(val) => {
                    setSelectedClass(val);
                    setSelectedSection(""); // Reset section on class change
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Section
                </label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                  disabled={!selectedClass}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentClass?.sections.map((sec) => (
                      <SelectItem key={sec._id} value={sec.name}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Examination
                </label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams?.map((exam) => (
                      <SelectItem key={exam._id} value={exam._id}>
                        {exam.name} ({exam.academicYear})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pb-1 text-[11px] text-slate-400 italic">
                {loadingResults
                  ? "Loading..."
                  : `${results.length} Results Found`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PRINT VIEW */}
        {!selectedClass || !selectedExam ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl print:hidden">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-slate-900 font-bold">Selection Required</h3>
            <p className="text-slate-500 text-sm">
              Please select a class and exam to generate transcripts.
            </p>
          </div>
        ) : (
          <BulkPrintView results={results} />
        )}
      </div>
    </MainLayout>
  );
};

export default ResultCardsPrintPage;
