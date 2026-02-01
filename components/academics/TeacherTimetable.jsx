"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  Filter,
  Printer,
  AlertTriangle,
  Coffee,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "@/lib/utils";

const fetcher = (url) => fetch(url).then((res) => res.json());

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TeacherTimetable() {
  const { data, isLoading, error } = useSWR(
    "/api/academics/timetable",
    fetcher,
  );
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const uniqueTeachers = useMemo(() => {
    if (!data?.data) return [];
    const teacherMap = new Map();
    data.data.forEach((cls) => {
      cls.schedule?.forEach((d) => {
        d.periods?.forEach((p) => {
          if (!p.teacher) return;
          const id = typeof p.teacher === "object" ? p.teacher._id : p.teacher;
          if (!teacherMap.has(id)) {
            teacherMap.set(id, {
              _id: id,
              name:
                typeof p.teacher === "object"
                  ? p.teacher.name
                  : "Unknown Teacher",
            });
          }
        });
      });
    });
    return Array.from(teacherMap.values());
  }, [data]);

  // Extract unique time slots for the matrix header
  const allTimeSlots = useMemo(() => {
    if (!data?.data) return [];
    const slots = new Set();
    data.data.forEach((cls) => {
      cls.schedule?.forEach((d) => {
        d.periods?.forEach((p) => slots.add(p.time));
      });
    });
    return Array.from(slots).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const getTeacherPeriodsForDay = (day) => {
    if (!selectedTeacher || !data?.data) return [];
    let periods = [];
    data.data.forEach((cls) => {
      const dayEntry = cls.schedule?.find((d) => d.day === day);
      if (!dayEntry) return;
      dayEntry.periods.forEach((p) => {
        const teacherId =
          typeof p.teacher === "object" ? p.teacher._id : p.teacher;
        if (teacherId === selectedTeacher) {
          periods.push({
            className: cls.name,
            time: p.time,
            subject: p.subjectName || p.subject,
          });
        }
      });
    });
    return periods.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handlePrint = () => window.print();

  if (isLoading) return <LoadingSpinner className="mx-auto mt-20" />;
  if (error)
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Failed to sync schedule.
      </div>
    );

  const currentTeacherName = uniqueTeachers.find(
    (t) => t._id === selectedTeacher,
  )?.name;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* HEADER SECTION - Hidden on Print */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            Faculty Schedule
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Personalized workload and period distribution.
          </p>
        </div>

        <div className="w-full lg:w-80 space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
            Faculty Member
          </label>
          <Select onValueChange={setSelectedTeacher}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 shadow-sm bg-white">
              <SelectValue placeholder="Search Teacher..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {uniqueTeachers.map((t) => (
                <SelectItem
                  key={t._id}
                  value={t._id}
                  className="rounded-xl my-1"
                >
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedTeacher ? (
        <div className="h-[300px] sm:h-[400px] border-2 border-dashed border-slate-100 rounded-[2rem] bg-white flex flex-col items-center justify-center text-slate-400 space-y-4 print:hidden">
          <Filter className="h-10 w-10 opacity-20" />
          <p className="font-bold text-center px-6">
            Select a teacher to visualize their timetable
          </p>
        </div>
      ) : (
        <Tabs defaultValue="daily" className="w-full">
          {/* CONTROL BAR - Hidden on Print */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <TabsList className="bg-slate-100/50 border border-slate-200/50 p-1.5 rounded-2xl h-14 w-full sm:w-auto overflow-x-auto">
                <TabsTrigger
                  value="daily"
                  className="flex-1 sm:flex-none rounded-xl px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  Daily Glance
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="flex-1 sm:flex-none rounded-xl px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  Full Week View
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                className="h-14 w-14 rounded-2xl border-slate-200 bg-white shrink-0"
              >
                <Printer className="h-5 w-5 text-slate-600" />
              </Button>
            </div>
            <Badge
              variant="outline"
              className="bg-white px-4 py-2 rounded-xl border-slate-200 text-slate-600 font-bold whitespace-nowrap"
            >
              {currentTeacherName}
            </Badge>
          </div>

          {/* PRINT-ONLY HEADER */}
          <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-2">
            <h2 className="text-2xl font-black uppercase">
              {currentTeacherName} - Weekly Schedule
            </h2>
          </div>

          {/* DAILY GLANCE - INTACT */}
          <TabsContent value="daily">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
              <div className="lg:col-span-8 space-y-4 print:space-y-6">
                {WEEKDAYS.map((day) => {
                  const periods = getTeacherPeriodsForDay(day);
                  const isToday = WEEKDAYS[new Date().getDay() - 1] === day;
                  return (
                    <Card
                      key={day}
                      className={cn(
                        "border border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white print:border-slate-300 print:rounded-none",
                        isToday ? "ring-2 ring-primary/20 shadow-lg" : "",
                      )}
                    >
                      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center print:bg-slate-50">
                        <h3
                          className={cn(
                            "text-lg font-black uppercase tracking-tighter",
                            isToday
                              ? "text-primary print:text-black"
                              : "text-slate-800",
                          )}
                        >
                          {day}
                        </h3>
                        {isToday && (
                          <Badge className="bg-primary text-white font-black print:hidden">
                            TODAY
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-0">
                        {periods.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 font-medium italic text-xs">
                            No periods assigned
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-50">
                            {periods.map((p, i) => (
                              <div
                                key={i}
                                className="group p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4"
                              >
                                <div className="flex items-center gap-6">
                                  <div className="flex flex-col min-w-[100px]">
                                    <span className="text-xl font-black text-slate-900 tracking-tighter tabular-nums">
                                      {p.time.split(" - ")[0]}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase print:hidden">
                                      Start Time
                                    </span>
                                  </div>
                                  <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
                                  <div>
                                    <h4 className="text-base font-black text-slate-800">
                                      {p.subject}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                      <span className="flex items-center text-xs text-slate-500 font-bold gap-1.5">
                                        <MapPin className="h-3 w-3 text-primary" />{" "}
                                        {p.className}
                                      </span>
                                      <span className="flex items-center text-xs text-slate-500 font-bold gap-1.5">
                                        <Clock className="h-3 w-3" />{" "}
                                        {p.time.split(" - ")[1]} End
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-200 hidden sm:block print:hidden" />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="lg:col-span-4 print:hidden">
                <Card className="border border-slate-200 bg-white rounded-[2.5rem] p-8 shadow-sm lg:sticky lg:top-6">
                  <h3 className="text-xs font-black mb-8 uppercase tracking-widest text-slate-400">
                    Weekly Summary
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-8">
                    <StatItem
                      label="Total Periods"
                      value={WEEKDAYS.reduce(
                        (acc, d) => acc + getTeacherPeriodsForDay(d).length,
                        0,
                      )}
                    />
                    <StatItem
                      label="Unique Classes"
                      value={
                        new Set(
                          WEEKDAYS.flatMap((d) =>
                            getTeacherPeriodsForDay(d).map((p) => p.className),
                          ),
                        ).size
                      }
                    />
                    <StatItem
                      label="Est. Hours"
                      value={
                        WEEKDAYS.reduce(
                          (acc, d) => acc + getTeacherPeriodsForDay(d).length,
                          0,
                        ) * 0.75
                      }
                      suffix=" hrs"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FULL WEEK MATRIX VIEW */}
          <TabsContent value="weekly" className="m-0 print:block">
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 bg-white shadow-sm print:shadow-none print:border-slate-300 print:rounded-none">
              <table className="w-full border-collapse min-w-[1000px] print:min-w-full">
                <thead>
                  <tr className="bg-slate-50 print:bg-slate-100">
                    <th className="p-6 text-left border-r border-slate-100 font-black text-slate-400 uppercase text-[10px] tracking-widest w-40">
                      Day / Time
                    </th>
                    {allTimeSlots.map((slot) => (
                      <th
                        key={slot}
                        className="p-4 text-center border-r border-slate-100 font-black text-slate-900 text-[11px] tabular-nums leading-tight"
                      >
                        {slot.split(" - ").join("\n")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {WEEKDAYS.map((day) => {
                    const dayPeriods = getTeacherPeriodsForDay(day);
                    return (
                      <tr
                        key={day}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4 border-r border-slate-100 font-black text-slate-800 uppercase text-xs bg-slate-50/30 print:bg-white">
                          {day}
                        </td>
                        {allTimeSlots.map((slot) => {
                          const matches = dayPeriods.filter(
                            (p) => p.time === slot,
                          );
                          const isConflict = matches.length > 1;
                          const isFree = matches.length === 0;

                          return (
                            <td
                              key={slot}
                              className={cn(
                                "p-2 border-r border-slate-100 align-top min-w-[140px]",
                                isConflict
                                  ? "bg-rose-50"
                                  : isFree
                                    ? "bg-slate-50/20"
                                    : "",
                              )}
                            >
                              {isFree ? (
                                <div className="flex flex-col items-center justify-center py-4 opacity-20 print:opacity-40">
                                  <Coffee className="h-4 w-4 mb-1" />
                                  <span className="text-[8px] font-bold uppercase tracking-tighter">
                                    Free
                                  </span>
                                </div>
                              ) : (
                                matches.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "p-3 rounded-xl mb-1 last:mb-0 border shadow-sm",
                                      isConflict
                                        ? "bg-white border-rose-300"
                                        : "bg-white border-slate-100",
                                    )}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[9px] font-black text-primary uppercase">
                                        {p.className}
                                      </span>
                                      {isConflict && (
                                        <AlertTriangle className="h-3 w-3 text-rose-500 animate-pulse" />
                                      )}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                      {p.subject}
                                    </p>
                                    {isConflict && (
                                      <p className="text-[8px] text-rose-600 font-black mt-1 uppercase">
                                        Conflict!
                                      </p>
                                    )}
                                  </div>
                                ))
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend for Matrix */}
            <div className="mt-4 flex gap-6 print:hidden">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-rose-50 border border-rose-200 rounded-sm" />{" "}
                Overlap/Conflict
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-3 h-3 bg-slate-50 border border-slate-100 rounded-sm" />{" "}
                Free Slot
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function StatItem({ label, value, suffix = "" }) {
  return (
    <div className="flex flex-col">
      <p className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">
        {value}
        {suffix}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
        {label}
      </p>
    </div>
  );
}
