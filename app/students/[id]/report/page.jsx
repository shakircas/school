"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Printer,
  Calendar,
  User,
  BookOpen,
  MessageSquareQuote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import AttendanceCircle from "@/components/reports/AttendanceCircle";
import StudentProgressChart from "@/components/reports/StudentProgressChart";
import AttendanceHistoryTable from "@/components/reports/AttendanceHistoryTable";
import AttendanceCalendar from "@/components/reports/AttendanceCalendar";
import { MainLayout } from "@/components/layout/main-layout";

export default function StudentReportPage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState(""); // State for Principal's Remarks

  useEffect(() => {
    if (!id) return;
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/student/${id}?year=2025`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch report", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading)
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 print:p-0 print:space-y-6">
        {/* ACTION BAR */}
        <div className="flex justify-between items-center print:hidden">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-2 bg-indigo-600"
          >
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>

        {/* PRINT ONLY HEADER */}
        <div className="hidden print:flex justify-between items-center border-b-4 border-slate-900 pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              Progress Report
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Academic Year 2025-26
            </p>
          </div>
          <div className="text-right uppercase">
            <p className="text-sm font-black">{data.student.name}</p>
            <p className="text-[10px] font-bold text-slate-400">
              Section: {data.student.sectionId}
            </p>
          </div>
        </div>

        {/* STUDENT INFO BAR */}
        <header className="bg-primary text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:text-slate-900 print:p-0 print:border-b print:rounded-none">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {data.student.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-white print:text-slate-600">
              <span className="flex items-center gap-1">
                <User size={14} /> {data.student.rollNumber}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={14} />{" "}
                {data.student.classId?.name || "Class Record"}
              </span>
            </div>
          </div>
          <Badge
            className={`${data.student.status === "Active" ? "bg-emerald-500" : "bg-rose-500"} px-4 py-1 uppercase font-bold print:border print:text-black`}
          >
            {data.student.status}
          </Badge>
        </header>

        {/* STATS & CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3">
          <AttendanceCircle reportData={data.report} />
          <div className="lg:col-span-2 print:col-span-2">
            <StudentProgressChart reportData={data.report} />
          </div>
        </div>

        {/* PRINCIPAL REMARKS INPUT (Screen Only) */}
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-3 print:hidden">
          <div className="flex items-center gap-2 text-indigo-900 font-bold">
            <MessageSquareQuote size={18} />
            <label>Principal's Remarks (Optional)</label>
          </div>
          <Textarea
            placeholder="Type a note for the parent-teacher meeting here..."
            className="bg-white border-indigo-200 focus:ring-indigo-500 min-h-[100px]"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <p className="text-[10px] text-indigo-400 font-medium">
            This text will appear in the printed PDF report.
          </p>
        </div>

        {/* PRINCIPAL REMARKS BOX (Print Only) */}
        {remarks && (
          <div className="hidden print:block space-y-2 pt-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-l-4 border-indigo-600 pl-3">
              Leadership Observations
            </h3>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 italic text-slate-700 text-sm leading-relaxed">
              "{remarks}"
            </div>
          </div>
        )}

        {/* CALENDAR VISUALIZER */}
        {/* DYNAMIC CALENDAR VISUALIZER */}
        <div className="space-y-4 pt-4 break-inside-avoid">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight border-l-4 border-indigo-600 pl-3">
            Attendance Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
            {/* This generates the current month, and the 2 months before it */}
            {[0, 1, 2].map((offset) => {
              const d = new Date(); // Today
              d.setMonth(d.getMonth() - (2 - offset)); // Adjust to show Oct, Nov, Dec OR Nov, Dec, Jan
              return (
                <AttendanceCalendar
                  key={offset}
                  history={data.history}
                  month={d.getMonth() + 1}
                  year={d.getFullYear()}
                />
              );
            })}
          </div>
        </div>

        {/* HISTORY TABLE */}
        <div className="space-y-4 pt-4 break-inside-avoid">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight border-l-4 border-indigo-600 pl-3">
            Detailed Log
          </h3>
          <AttendanceHistoryTable history={data.history} />
        </div>

        {/* SIGNATURE FOOTER (Print Only) */}
        <div className="hidden print:grid grid-cols-3 gap-12 mt-20 text-[9px] font-black uppercase text-slate-400 text-center">
          <div className="border-t-2 border-slate-200 pt-3">Class Teacher</div>
          <div className="border-t-2 border-slate-200 pt-3">
            Parent / Guardian
          </div>
          <div className="border-t-2 border-slate-200 pt-3 text-indigo-600 border-indigo-100">
            Principal Signature
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            font-size: 12pt;
          }
          .main-layout-sidebar,
          .main-layout-header {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </MainLayout>
  );
}
