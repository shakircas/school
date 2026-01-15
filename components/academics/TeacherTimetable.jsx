"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  BookOpen,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  Filter,
  LayoutGrid,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    fetcher
  );
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // 1. Extract Unique Teachers (Memoized for performance)
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
    // Sort by time
    return periods.sort((a, b) => a.time.localeCompare(b.time));
  };

  if (isLoading) return <LoadingSpinner className="mx-auto mt-20" />;
  if (error)
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        Failed to sync schedule.
      </div>
    );

  const currentTeacherName = uniqueTeachers.find(
    (t) => t._id === selectedTeacher
  )?.name;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Faculty Schedule
          </h1>
          <p className="text-slate-500 font-medium">
            Personalized workload and period distribution.
          </p>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
            Select Faculty Member
          </label>
          <Select onValueChange={setSelectedTeacher}>
            <SelectTrigger className="h-12 rounded-2xl border-none shadow-sm bg-white ring-1 ring-slate-200">
              <SelectValue placeholder="Search Teacher..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
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
        <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="p-4 bg-slate-50 rounded-full">
            <Filter className="h-10 w-10 opacity-20" />
          </div>
          <p className="font-bold">
            Select a teacher to visualize their timetable
          </p>
        </div>
      ) : (
        <Tabs defaultValue="daily" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14">
              <TabsTrigger
                value="daily"
                className="rounded-xl px-8 h-full data-[state=active]:shadow-md"
              >
                Daily Glance
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="rounded-xl px-8 h-full data-[state=active]:shadow-md"
              >
                Full Week
              </TabsTrigger>
            </TabsList>
            <Badge
              variant="outline"
              className="hidden md:flex bg-white px-4 py-2 rounded-full border-slate-200 text-slate-600 font-bold"
            >
              {currentTeacherName}
            </Badge>
          </div>

          {/* DAILY VIEW - HIGH CONTRAST TIMELINE */}
          <TabsContent value="daily">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                {WEEKDAYS.map((day) => {
                  const periods = getTeacherPeriodsForDay(day);
                  const isToday = WEEKDAYS[new Date().getDay() - 1] === day;

                  return (
                    <Card
                      key={day}
                      className={cn(
                        "border-none shadow-sm rounded-[2rem] overflow-hidden transition-all",
                        isToday
                          ? "ring-2 ring-primary shadow-xl"
                          : "opacity-80 hover:opacity-100"
                      )}
                    >
                      <div
                        className={cn(
                          "px-8 py-4 flex justify-between items-center",
                          isToday
                            ? "bg-primary text-white"
                            : "bg-slate-900 text-white"
                        )}
                      >
                        <h3 className="text-xl font-black uppercase tracking-tighter">
                          {day}
                        </h3>
                        {isToday && (
                          <Badge className="bg-white text-primary font-black">
                            TODAY
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-0 bg-white">
                        {periods.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 font-medium italic text-sm">
                            No periods assigned
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-50">
                            {periods.map((p, i) => (
                              <div
                                key={i}
                                className="group p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-8">
                                  {/* THE LARGE TIME BLOCK */}
                                  <div className="flex flex-col min-w-[140px]">
                                    <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                                      {p.time.split(" - ")[0]}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">
                                      Start Time
                                    </span>
                                  </div>

                                  <div className="h-10 w-[2px] bg-slate-100 hidden md:block" />

                                  <div>
                                    <h4 className="text-lg font-black text-slate-800">
                                      {p.subject}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span className="flex items-center text-sm text-slate-500 font-bold gap-1.5">
                                        <MapPin className="h-3 w-3 text-primary" />{" "}
                                        {p.className}
                                      </span>
                                      <span className="flex items-center text-sm text-slate-500 font-bold gap-1.5">
                                        <Clock className="h-3 w-3" />{" "}
                                        {p.time.split(" - ")[1]} End
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-primary transition-colors hidden md:block" />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* SIDEBAR STATS */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none bg-slate-900 text-white rounded-[2rem] p-8">
                  <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-400">
                    Weekly Impact
                  </h3>
                  <div className="space-y-8">
                    <StatItem
                      label="Total Periods"
                      value={WEEKDAYS.reduce(
                        (acc, day) => acc + getTeacherPeriodsForDay(day).length,
                        0
                      )}
                    />
                    <StatItem
                      label="Unique Classes"
                      value={
                        new Set(
                          WEEKDAYS.flatMap((day) =>
                            getTeacherPeriodsForDay(day).map((p) => p.className)
                          )
                        ).size
                      }
                    />
                    <StatItem
                      label="Est. Teaching Hours"
                      value={
                        WEEKDAYS.reduce(
                          (acc, day) =>
                            acc + getTeacherPeriodsForDay(day).length,
                          0
                        ) * 0.75
                      }
                      suffix=" hrs"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* WEEKLY GRID VIEW */}
          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {WEEKDAYS.map((day) => (
                <div key={day} className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-center border-b-4 border-primary">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                      {day}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {getTeacherPeriodsForDay(day).map((p, i) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all"
                      >
                        <p className="text-xs font-black text-primary mb-1">
                          {p.time}
                        </p>
                        <p className="font-bold text-slate-800 leading-tight">
                          {p.subject}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 border-none text-[10px]"
                          >
                            {p.className}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function StatItem({ label, value, suffix = "" }) {
  return (
    <div>
      <p className="text-3xl font-black">
        {value}
        {suffix}
      </p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}
