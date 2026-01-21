"use client";

import { useState } from "react";
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
  FileBarChart,
  Calendar as CalendarIcon,
  Download,
} from "lucide-react";
import AttendanceSummary from "./attendance-summary";
import AttendanceTable from "./attendance-table";
import AttendanceTrendChart from "./attendance-trend-chart";

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

export default function AttendanceRegisterView() {
  const [filters, setFilters] = useState({
    classId: "",
    sectionId: "",
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  });

  const { data: classesData } = useSWR("/api/academics/classes", fetcher);
  const classes = classesData?.data || [];

  const queryPath = `/api/attendance/register?classId=${filters.classId}&sectionId=${filters.sectionId}&month=${filters.month}&year=${filters.year}`;
  const { data, isLoading } = useSWR(
    filters.classId && filters.sectionId ? queryPath : null,
    fetcher
  );

  const selectedClass = classes.find((c) => c._id === filters.classId);

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (!data) return;

    const { students, attendanceDocs, daysInMonth } = data;
    const attendanceMap = buildAttendanceMap(attendanceDocs); // Assuming this is imported

    // 1. Create Headers: Roll, Name, 1, 2, 3... Days, P, A, %
    const headers = [
      "Roll",
      "Name",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      "Present",
      "Absent",
      "Percentage",
    ];

    // 2. Map Student Data to Rows
    const rows = students.map((s) => {
      let pCount = 0;
      let aCount = 0;

      const dailyStatus = Array.from({ length: daysInMonth }, (_, i) => {
        const status = attendanceMap[i + 1]?.[s._id];
        if (status === "Present") pCount++;
        if (status === "Absent") aCount++;
        return status || "-";
      });

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
        `${percentage}%`,
      ];
    });

    // 3. Combine and Download
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Attendance_${filters.month}_${filters.year}.csv`
    );
    link.click();
  };

  const { data: trendData } = useSWR(
    "/api/attendance/stats?type=Student",
    fetcher
  );

  console.log(trendData);

  return (
    <div className="space-y-6">
      {/* FILTER BAR - Hidden on Print */}
      <Card className="print:hidden border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
            <Filter className="h-4 w-4" />
            <span>Query Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Class
              </Label>
              <Select
                value={filters.classId}
                onValueChange={(v) =>
                  setFilters({ ...filters, classId: v, sectionId: "" })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Class" />
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

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Section
              </Label>
              <Select
                value={filters.sectionId}
                onValueChange={(v) => setFilters({ ...filters, sectionId: v })}
                disabled={!filters.classId}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Section" />
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

            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={!data}
              className="bg-white border-slate-200 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 mr-2 text-slate-600" /> Export CSV
            </Button>

            <Button
              onClick={() => window.print()}
              disabled={!data}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
            >
              <Printer className="h-4 w-4 mr-2" /> Print Register
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
        <div className="space-y-6 animate-in fade-in duration-500">
          <AttendanceSummary
            students={data.students}
            attendanceDocs={data.attendanceDocs}
            daysInMonth={data.daysInMonth}
          />

          {/* The Trend Chart takes up 1 column */}
          <div className="lg:col-span-1">
            <AttendanceTrendChart data={trendData || []} label="Staff" />
          </div>

          <div className="print:m-0 print:p-0">
            <AttendanceTable
              students={data.students}
              attendanceDocs={data.attendanceDocs}
              daysInMonth={data.daysInMonth}
              month={filters.month}
              year={filters.year}
            />
          </div>
        </div>
      )}
    </div>
  );
}
