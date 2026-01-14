"use client";

import { useState, useRef } from "react";
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
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Printer, School } from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { useExams } from "../hooks/useExams";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function RollSlipsContent() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const slipRef = useRef(null);

  const { data: students, isLoading } = useSWR(
    selectedClass && selectedSection
      ? `/api/students?classId=${selectedClass}&sectionId=${selectedSection}`
      : null,
    fetcher
  );
  console.log(selectedExam);
  const { classes } = useClasses();
  const {
    data: examsRes,
    isLoading: isLoadingExams,
    mutate,
  } = useSWR("/api/exams", fetcher);
  const exams = examsRes?.data || [];

  const exam = exams?.find((e) => e._id === selectedExam);
  console.log(exams, exam);

  const handlePrint = () => {
    window.print();
  };

  const getClassName = (student) =>
    classes?.find((c) => c._id === student.classId)?.name ||
    student.classId.name ||
    "-";

  const getSectionName = (student) =>
    classes
      ?.find((c) => c._id === student.classId)
      ?.sections.find((s) => s._id === student.sectionId)?.name || student.sectionId || "-";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roll Number Slips"
        description="Generate roll number slips for examinations"
      >
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={!selectedClass || !selectedSection || !selectedExam}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print All
        </Button>
      </PageHeader>

      {/* Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
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

            <div className="w-48">
              {selectedClass && (
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes
                      ?.find((c) => c._id === selectedClass)
                      ?.sections.map((sec) => (
                        <SelectItem key={sec._id} value={sec.name}>
                          {sec.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="w-64">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Examination" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} - {exam.examType} - {exam.academicYear} -{" "}
                      {exam.classId.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roll Slips Grid */}
      <div
        ref={slipRef}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3"
      >
        {students?.students.map((student) => (
          <Card
            key={student._id}
            className="border border-black rounded-md p-3 text-[11px] leading-tight print:break-inside-avoid"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black pb-2 mb-2">
              <div>
                <h3 className="text-sm font-bold uppercase">
                  EduManage School
                </h3>
                <p className="text-[10px]">Examination Roll Number Slip</p>
              </div>

              <Avatar className="h-10 w-10 border border-black">
                <AvatarImage src={student.photo} />
                <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            {/* Exam Info */}
            <div className="text-center mb-2">
              <p className="font-semibold uppercase">{exam?.name}</p>
              <p className="text-[10px]">
                {exam?.examType} • {exam?.academicYear}
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <p>
                <b>Name:</b> {student.name}
              </p>
              <p>
                <b>Roll No:</b> {student.rollNumber}
              </p>

              <p>
                <b>Class:</b> {getClassName(student)} -{" "}
                {getSectionName(student)}
              </p>

              <p>
                <b>Father:</b> {student.fatherName}
              </p>
            </div>

            {/* Subjects Table */}
            {/* Subjects Table */}
            <div className="mt-2 border-t border-black pt-2">
              <table className="w-full border border-black text-[10px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="p-1 w-6 text-center">#</th>
                    <th className="p-1 text-left">Subject</th>
                    <th className="p-1 text-left">Day</th>
                    <th className="p-1 text-left">Date</th>
                    <th className="p-1 text-left">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {exam?.schedule?.map((s, idx) => (
                    <tr
                      key={idx}
                      className="border-b last:border-b-0 border-black"
                    >
                      <td className="p-1 text-center">{idx + 1}</td>
                      <td className="p-1">{s.subject}</td>
                      <td className="p-1">
                        {s.date
                          ? new Date(s.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })
                          : "-"}
                      </td>
                      <td className="p-1">
                        {s.date ? new Date(s.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-1">
                        {s.startTime} – {s.endTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-3 flex justify-between items-end text-[10px]">
              <p>Issued: {new Date().toLocaleDateString()}</p>
              <div className="text-right">
                <div className="border-t border-black w-20 mb-1"></div>
                <p>Principal</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
