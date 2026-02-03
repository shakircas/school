"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Printer,
  Filter,
  Calendar as CalendarIcon,
  Download,
} from "lucide-react";
import AttendanceSummary from "./attendance-summary";
import AttendanceTable from "./attendance-table";
import AttendanceTrendChart from "./attendance-trend-chart";
import AttendanceRegisterStats from "./AttendanceRegisterStats";
import { buildAttendanceMap } from "@/lib/attendance-utils";

const fetcher = (url) => fetch(url).then((res) => res.json());

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = ["2024", "2025", "2026"].map((y) => ({ value: y, label: y }));

export default function AttendanceRegisterView() {
  const [filters, setFilters] = useState({
    classId: "",
    sectionId: "A",
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  });

  const { data: classesData } = useSWR("/api/academics/classes", fetcher);
  const classes = classesData?.data || [];

  const queryPath = `/api/attendance/register?classId=${filters.classId}&sectionId=${filters.sectionId || "A"}&month=${filters.month}&year=${filters.year}`;
  const { data, isLoading } = useSWR(
    filters.classId ? queryPath : null,
    fetcher,
  );

  console.log(data);

  const { data: trendData } = useSWR(
    "/api/attendance/stats?type=Student",
    fetcher,
  );

  useEffect(() => {
    if (classes.length > 0 && !filters.classId) {
      setFilters((prev) => ({
        ...prev,
        classId: classes[0]._id,
        sectionId: classes[0].sections?.[0]?.name || "A",
      }));
    }
  }, [classes]);

  // Add this useEffect to load from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("attendance_filters");
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      setFilters((prev) => ({
        ...prev,
        classId: parsed.classId || prev.classId,
        sectionId: parsed.sectionId || prev.sectionId,
      }));
    }
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const { students, attendanceDocs, daysInMonth, sessionStats } = data;
    const attendanceMap = buildAttendanceMap(attendanceDocs);

    const headers = [
      "Roll",
      "Name",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      "Curr P",
      "Curr A",
      "Prev P",
      "Grand Total",
      "%",
    ];

    const rows = students.map((s) => {
      let pCount = 0;
      let aCount = 0;

      const dailyStatus = Array.from({ length: daysInMonth }, (_, i) => {
        const status = attendanceMap[i + 1]?.[s._id];
        if (status === "Present") pCount++;
        if (status === "Absent") aCount++;
        return status || "-";
      });

      const grandTotal = s.totalPresentTillDate || 0;
      const prevP = grandTotal - pCount;
      const percentage =
        pCount + aCount > 0
          ? Math.round((pCount / (pCount + aCount)) * 100)
          : 0;

      return [
        s.rollNumber,
        s.name,
        ...dailyStatus,
        pCount,
        aCount,
        prevP > 0 ? prevP : 0,
        grandTotal,
        `${percentage}%`,
      ];
    });

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_${filters.month}_${filters.year}.csv`;
    link.click();
  };

  const selectedClass = classes.find((c) => c._id === filters.classId);

  return (
    <div className="space-y-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { 
            size: landscape; 
            margin: 12mm; 
          }
          body { 
            -webkit-print-color-adjust: exact; 
          }
          .print-full-width {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `,
        }}
      />
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
            <Filter className="h-4 w-4" />
            <span>Query Filters</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
            {/* Class Select */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Class
              </Label>
              <Select
                value={filters.classId}
                onValueChange={(v) =>
                  setFilters({ ...filters, classId: v, sectionId: "A" })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Select */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Section
              </Label>
              <Select
                value={filters.sectionId}
                onValueChange={(v) => setFilters({ ...filters, sectionId: v })}
                // disabled={!filters.classId}
                defaultValue="A"
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClass?.sections?.map((s) => (
                    <SelectItem key={s._id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Select */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Month
              </Label>
              <Select
                value={filters.month}
                onValueChange={(v) => setFilters({ ...filters, month: v })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Select */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Year
              </Label>
              <Select
                value={filters.year}
                onValueChange={(v) => setFilters({ ...filters, year: v })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={!data}
              className="bg-white"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>

            <Button
              onClick={() => window.print()}
              disabled={!data}
              className="bg-indigo-600 text-white"
            >
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {!filters.classId || !filters.sectionId ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-slate-400">
          <CalendarIcon className="h-12 w-12 mb-2 opacity-20" />
          <p>Select class and section to view records</p>
        </div>
      ) : isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <AttendanceSummary
            students={data.students}
            attendanceDocs={data.attendanceDocs}
            daysInMonth={data.daysInMonth}
          />
          {/* <AttendanceTrendChart
            data={trendData || []}
            label="Attendance Trend"
          /> */}
          <AttendanceTable
            students={data.students}
            attendanceDocs={data.attendanceDocs}
            daysInMonth={data.daysInMonth}
            month={filters.month}
            year={filters.year}
            sessionStats={data.sessionStats}
          />
          <AttendanceRegisterStats
            data={data}
            currentMonth={filters.month}
            currentYear={filters.year}
            
          />
        </div>
      )}
    </div>
  );
}
