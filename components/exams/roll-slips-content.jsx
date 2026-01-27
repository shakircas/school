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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Printer,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function RollSlipsContent() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const slipRef = useRef(null);

  const { data: studentsRes } = useSWR(
    selectedClass && selectedSection
      ? `/api/students?classId=${selectedClass}&sectionId=${selectedSection}`
      : null,
    fetcher,
  );

  const { classes } = useClasses();
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const exams = examsRes?.data || [];
  const exam = exams?.find((e) => e._id === selectedExam);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="print:hidden">
      <PageHeader
        title="Examination Slips"
        description="Clean, ink-efficient official hall tickets"
      >
        <Button
          onClick={handlePrint}
          disabled={!selectedClass || !selectedSection || !selectedExam}
          className="bg-slate-900 hover:bg-black text-white px-6"
        >
          <Printer className="h-4 w-4 mr-2" />
          Generate & Print
        </Button>
      </PageHeader>
      </div>

      {/* Selection Filter */}
      <Card className="print:hidden border border-slate-200 shadow-none bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Select value={selectedSection} onValueChange={setSelectedSection}>
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

            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                {exams?.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roll Slips Container */}
      <div ref={slipRef} className="space-y-6 print:space-y-0 print:block">
        {studentsRes?.students.map((student, idx) => (
          <div key={student._id}>
            <Card className="border-2 border-slate-300 rounded-none shadow-none mb-6 print:mb-0 print:h-[31.5vh] overflow-hidden break-inside-avoid">
              {/* SLIP TOP: School Branding */}
              <div className="px-6 py-3 border-b-2 border-slate-300 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-1 border-2 border-slate-900 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight">
                      EduManage Academy
                    </h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-none">
                      Hall Entry Ticket • {exam?.academicYear}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 uppercase tracking-widest">
                    Roll No: {student.rollNumber}
                  </span>
                </div>
              </div>

              {/* SLIP MIDDLE: Candidate & Exam Info */}
              <div className="p-5 flex gap-6">
                {/* PHOTO SLOT */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 rounded-md border border-slate-200">
                    <AvatarImage src={student.photo} className="object-cover" />
                    <AvatarFallback className="bg-slate-50 text-slate-400">
                      {student.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* CANDIDATE DETAILS */}
                <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                  <div className="border-b border-slate-100 pb-1">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block">
                      Candidate Name
                    </span>
                    <span className="font-bold uppercase text-slate-800">
                      {student.name}
                    </span>
                  </div>
                  <div className="border-b border-slate-100 pb-1">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block">
                      Father's Name
                    </span>
                    <span className="font-bold uppercase text-slate-800">
                      {student.fatherName}
                    </span>
                  </div>
                  <div className="border-b border-slate-100 pb-1">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block">
                      Class / Section
                    </span>
                    <span className="font-bold uppercase text-slate-800">
                      {selectedClass &&
                        classes?.find((c) => c._id === selectedClass)
                          ?.name}{" "}
                      ({selectedSection})
                    </span>
                  </div>
                  <div className="border-b border-slate-100 pb-1">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block">
                      Examination
                    </span>
                    <span className="font-bold uppercase text-slate-800 truncate">
                      {exam?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* SLIP BOTTOM: Schedule Table */}
              <div className="px-5 pb-5">
                <table className="w-full text-[10px] border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase text-[8px] font-black border-b border-slate-200">
                      <th className="py-2 px-3 text-left border-r">Date</th>
                      <th className="py-2 px-3 text-left border-r">Day</th>
                      <th className="py-2 px-3 text-left border-r">Subject</th>
                      <th className="py-2 px-3 text-center">Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam?.schedule?.map((s, sIdx) => (
                      <tr
                        key={sIdx}
                        className="border-b border-slate-100 last:border-0 italic font-medium"
                      >
                        <td className="py-1.5 px-3 border-r font-bold text-slate-700">
                          {new Date(s.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="py-1.5 px-3 border-r uppercase text-slate-400 text-[8px]">
                          {new Date(s.date).toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </td>
                        <td className="py-1.5 px-3 border-r font-black text-slate-900 uppercase tracking-tight">
                          {s.subject}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 font-bold">
                            <Clock className="w-2.5 h-2.5" /> {s.startTime}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer Notes */}
                <div className="mt-4 flex justify-between items-end border-t border-slate-100 pt-3">
                  <div className="text-[8px] text-slate-400 space-y-0.5">
                    <p>
                      • Admit card is mandatory for entry into the examination
                      hall.
                    </p>
                    <p>
                      • Mobile phones and electronic gadgets are strictly
                      prohibited.
                    </p>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <div className="h-6 w-24 border-b border-slate-900 mb-1"></div>
                    <p className="text-[8px] font-black uppercase text-slate-900">
                      Principal Signature
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Print separation logic */}
            {(idx + 1) % 3 === 0 && (
              <div className="hidden print:block print:page-break-after-always" />
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            background: white !important;
          }
          .print\:h-\[31\.5vh\] {
            height: 31.5vh;
            margin-bottom: 0.5vh;
          }
          .print\:page-break-after-always {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
