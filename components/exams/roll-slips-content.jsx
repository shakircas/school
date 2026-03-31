"use client";

import { useState, useMemo, useCallback } from "react";
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
  Clock,
  CheckCircle2,
  Loader2,
  User,
  AlertCircle,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";

const fetcher = (url) => fetch(url).then((res) => res.json());

const formatBoardRollNo = (student, className, section) => {
  if (student.rollNumber && String(student.rollNumber).length > 4)
    return student.rollNumber;
  const year = new Date().getFullYear().toString().slice(-2);
  const cleanClass = className.replace(/\D/g, "");
  const paddedId = String(student.id || student._id)
    .slice(-3)
    .padStart(3, "0");
  return `${year}-${cleanClass}${section}-${paddedId}`.toUpperCase();
};

export function RollSlipsContent() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedExam, setSelectedExam] = useState("");
  const [printingId, setPrintingId] = useState(null);

  const { classes, isLoading: classesLoading } = useClasses();

  const queryParams = new URLSearchParams({
    classId: selectedClass,
    sectionId: selectedSection,
  }).toString();

  const {
    data: studentsRes,
    isValidating: studentsLoading,
    error: studentsError,
  } = useSWR(selectedClass ? `/api/students?${queryParams}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const { data: examsRes } = useSWR("/api/exams", fetcher);

  const currentClass = useMemo(
    () => classes?.find((c) => c._id === selectedClass),
    [classes, selectedClass],
  );

  // FIX: Ensure exam updates when selectedExam changes
  const exam = useMemo(() => {
    if (!examsRes?.data || !selectedExam) return null;
    return examsRes.data.find((e) => e._id === selectedExam);
  }, [examsRes?.data, selectedExam]);

  const handlePrint = useCallback((id) => {
    setPrintingId(id);
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        setPrintingId(null);
      }, 150);
    });
  }, []);

  const studentsToDisplay = useMemo(() => {
    const list = studentsRes?.students || [];
    if (printingId) return list.filter((s) => s._id === printingId);
    return list;
  }, [studentsRes, printingId]);

  const formatDay = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(
      new Date(dateString),
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-0">
      <div className="print:hidden">
        <PageHeader
          title="Examination Hall Tickets"
          description="Official board-standard slips for students."
        >
          <Button
            onClick={() => handlePrint()}
            disabled={
              !selectedClass || !selectedExam || !studentsRes?.students?.length
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            <Printer className="h-4 w-4 mr-2" />
            Bulk Print ({studentsRes?.students?.length || 0})
          </Button>
        </PageHeader>
      </div>

      <Card className="print:hidden border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Grade/Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white border-slate-300">
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

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Section
              </label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue placeholder="Section A" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Active Examination
              </label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {(examsRes?.data || []).map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {studentsLoading && (
        <div className="flex flex-col items-center justify-center py-24 animate-in fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500 font-medium">
            Fetching candidate records...
          </p>
        </div>
      )}

      {studentsError && (
        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-800 font-medium">
            Failed to load student data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 print:block print:gap-0">
        {!studentsLoading &&
          studentsToDisplay.map((student, idx) => (
            <div
              key={student._id}
              className="relative group animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="absolute right-1 top-1 z-20 print:hidden opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white shadow-xl border border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => handlePrint(student._id)}
                >
                  <Printer className="h-3.5 w-3.5 mr-2" />
                  Print Single
                </Button>
              </div>

              <Card className="admit-card border-[1.5pt] border-black rounded-none shadow-none mb-4 print:mb-0  overflow-hidden break-inside-avoid relative bg-white text-black">
                <div className="px-6 py-3 border-b-[1.5pt] border-black flex justify-between items-center bg-slate-50 print:bg-transparent">
                  <div className="flex items-center gap-4">
                    <div className="p-1.5 bg-black rounded-full print:bg-black">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-tight leading-none mb-1">
                        EduManage International Academy
                      </h2>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                        Secondary School Certificate Examination •{" "}
                        {exam?.academicYear || "2025-2026"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black border-2 border-black px-3 py-1 uppercase bg-black text-white print:bg-black">
                      ROLL NO:{" "}
                      {formatBoardRollNo(
                        student,
                        currentClass?.name || "00",
                        selectedSection,
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex gap-8 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-28 w-28 rounded-none border-[1.5pt] border-black p-0.5 bg-white">
                      <AvatarImage
                        src={student.photo?.url}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-slate-50 text-slate-300">
                        <User size={48} strokeWidth={1} />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[7px] font-bold uppercase text-slate-400">
                      Official Photo
                    </span>
                  </div>

                  <div className="flex-grow grid grid-cols-2 gap-x-10 gap-y-4 pt-1">
                    <DetailBox
                      label="Candidate's Full Name"
                      value={student.name}
                    />
                    <DetailBox
                      label="Father/Guardian Name"
                      value={student.fatherName}
                    />
                    <DetailBox
                      label="Grade & Section"
                      value={`${currentClass?.name || "N/A"} - ${selectedSection}`}
                    />
                    <DetailBox
                      label="Examination Type"
                      value={exam?.name || "Annual Term"}
                    />
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <table className="w-full text-[10px] border-[1pt] border-black border-collapse">
                    <thead>
                      <tr className="bg-slate-100 print:bg-slate-100 border-b-[1pt] border-black">
                        <th className="py-1.5 px-2 text-left border-r-[1pt] border-black font-black uppercase text-[8px] w-[12%]">
                          Day
                        </th>
                        <th className="py-1.5 px-3 text-left border-r-[1pt] border-black font-black uppercase text-[8px]">
                          Date
                        </th>
                        <th className="py-1.5 px-3 text-left border-r-[1pt] border-black font-black uppercase text-[8px]">
                          Subject Title
                        </th>
                        <th className="py-1.5 px-3 text-center font-black uppercase text-[8px]">
                          Session Timing
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Guard against empty schedule */}
                      {exam?.schedule?.length > 0 ? (
                        exam.schedule.slice(0, 5).map((s, sIdx) => (
                          <tr
                            key={sIdx}
                            className="border-b-[0.5pt] border-black last:border-0"
                          >
                            <td className="py-1 px-2 border-r-[1pt] border-black font-bold uppercase text-slate-600">
                              {formatDay(s.date)}
                            </td>
                            <td className="py-1 px-3 border-r-[1pt] border-black font-bold">
                              {new Date(s.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-1 px-3 border-r-[1pt] border-black font-black uppercase tracking-tight">
                              {s.subject}
                            </td>
                            <td className="py-1 px-3 text-center font-medium">
                              <Clock className="inline w-2.5 h-2.5 mr-1 mb-0.5" />
                              {s.startTime} — {s.endTime || "12:00 PM"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-slate-400 italic"
                          >
                            No schedule available for this examination.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="mt-4 flex justify-between items-end border-t-[0.5pt] border-slate-200 pt-3">
                    <div className="text-[7px] text-slate-500 space-y-0.5 italic">
                      <p>
                        1. Entry strictly prohibited 15 minutes after start
                        time.
                      </p>
                      <p>
                        2. Possession of digital devices will lead to
                        disqualification.
                      </p>
                      <p>
                        3. This slip is valid only with the institutional
                        embossed seal.
                      </p>
                    </div>
                    <div className="flex gap-8 items-end">
                      <div className="text-center px-4">
                        <div className="h-8 w-24 border-b border-black mb-1 mx-auto"></div>
                        <p className="text-[7px] font-black uppercase">
                          Candidate Signature
                        </p>
                      </div>
                      <div className="text-center px-4">
                        <div className="h-8 w-24 border-b border-black mb-1 mx-auto flex items-end justify-center">
                          <span className="text-[8px] font-serif italic opacity-50">
                            Authorized
                          </span>
                        </div>
                        <p className="text-[7px] font-black uppercase">
                          Controller of Exams
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {!printingId && (idx + 1) % 3 === 0 && (
                <div className="hidden print:block page-break" />
              )}
            </div>
          ))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.4in;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page-break {
            page-break-after: always;
            height: 0;
          }
          .admit-card {
            print-color-adjust: exact;
            -webkit-filter: opacity(1);
          }
        }
      `}</style>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="border-b-[0.5pt] border-slate-300 pb-0.5">
      <span className="text-[7px] text-slate-500 font-bold uppercase block tracking-tight">
        {label}
      </span>
      <span className="font-black uppercase text-[11px] text-black truncate block leading-tight">
        {value || "---"}
      </span>
    </div>
  );
}
