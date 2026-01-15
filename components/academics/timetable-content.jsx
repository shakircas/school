"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  User,
  Trash2,
  Edit3,
  AlertTriangle,
  LayoutGrid,
  Calendar,
  Users,
  BarChart3,
  ChevronRight,
  Search,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const fetcher = (url) => fetch(url).then((res) => res.json());

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00 - 08:40",
  "08:40 - 09:20",
  "09:20 - 10:00",
  "10:00 - 10:40",
  "11:00 - 11:40",
  "11:40 - 12:20",
  "12:20 - 01:00",
];

export function TimetableContent() {
  const { data, mutate } = useSWR("/api/academics/timetable", fetcher);
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    day: "",
    time: "",
    subjectId: "",
    teacherId: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editMeta, setEditMeta] = useState({ index: null, day: "" });

  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsRes?.data || [];
  const classes = data?.data || [];

  /* --- CALCULATE WORKLOAD --- */
  const teacherWorkload = useMemo(() => {
    const stats = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((day) => {
        day.periods.forEach((p) => {
          const tId = p.teacher?._id || p.teacher;
          if (tId) {
            stats[tId] = (stats[tId] || 0) + 1;
          }
        });
      });
    });
    return stats;
  }, [classes]);

  /* --- CONFLICT LOGIC --- */
  const conflict = useMemo(() => {
    if (
      !formData.day ||
      !formData.time ||
      !formData.teacherId ||
      !classes.length
    )
      return null;
    for (const cls of classes) {
      const daySchedule = cls.schedule?.find((s) => s.day === formData.day);
      if (daySchedule) {
        const periodIdx = daySchedule.periods.findIndex(
          (p) =>
            p.time === formData.time &&
            (p.teacher?._id === formData.teacherId ||
              p.teacher === formData.teacherId)
        );
        if (periodIdx !== -1) {
          const isSelf =
            editMode &&
            cls._id === selectedClass?._id &&
            formData.day === editMeta.day &&
            periodIdx === editMeta.index;
          if (!isSelf) return cls.name;
        }
      }
    }
    return null;
  }, [formData, classes, editMode, editMeta, selectedClass]);

  const handleOpenEditor = (cls, p = null, day = "", idx = null) => {
    setSelectedClass(cls);
    if (p) {
      setEditMode(true);
      setEditMeta({ index: idx, day });
      setFormData({
        day,
        time: p.time,
        subjectId: p.subjectId,
        teacherId: p.teacher?._id || p.teacher,
      });
    } else {
      setEditMode(false);
      setFormData({ day: "", time: "", subjectId: "", teacherId: "" });
    }
    setIsOpen(true);
  };

  const savePeriod = async () => {
    if (conflict)
      return toast.error(`Conflict! Teacher is busy in ${conflict}`);
    const subjectName = subjects.find(
      (s) => s._id === formData.subjectId
    )?.name;
    try {
      const url = editMode
        ? `/api/academics/timetable/${selectedClass._id}`
        : "/api/academics/timetable";
      const method = editMode ? "PATCH" : "POST";
      let payload;
      if (editMode) {
        payload = {
          ...formData,
          subjectName,
          teacher: formData.teacherId,
          index: editMeta.index,
          day: editMeta.day,
        };
      } else {
        const sch = structuredClone(selectedClass.schedule || []);
        let d = sch.find((x) => x.day === formData.day);
        if (!d) {
          d = { day: formData.day, periods: [] };
          sch.push(d);
        }
        d.periods.push({
          ...formData,
          subjectName,
          teacher: formData.teacherId,
        });
        payload = { classId: selectedClass._id, schedule: sch };
      }
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Schedule Updated");
      setIsOpen(false);
      mutate();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Academic Scheduler
          </h1>
          <p className="text-sm text-slate-500">
            Conflicts are checked across all {classes.length} active classes.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <div className="px-3 py-1 text-xs font-bold text-slate-500 uppercase">
            Year: 2026
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="bg-white border p-1 rounded-2xl mb-6 shadow-sm">
          <TabsTrigger value="grid" className="rounded-xl px-5 gap-2">
            <LayoutGrid className="w-4 h-4" /> Weekly Grid
          </TabsTrigger>
          <TabsTrigger value="daily" className="rounded-xl px-5 gap-2">
            <Calendar className="w-4 h-4" /> Daily Glance
          </TabsTrigger>
          <TabsTrigger value="workload" className="rounded-xl px-5 gap-2">
            <BarChart3 className="w-4 h-4" /> Teacher Workload
          </TabsTrigger>
        </TabsList>

        {/* --- WEEKLY GRID CONTENT --- */}
        <TabsContent value="grid" className="space-y-12">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {cls.name.charAt(0)}
                  </div>
                  <h2 className="text-lg font-bold text-slate-700">
                    {cls.name}
                  </h2>
                </div>
                <Button
                  onClick={() => handleOpenEditor(cls)}
                  size="sm"
                  className="rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Session
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 divide-x divide-slate-100">
                {WEEKDAYS.map((day) => {
                  const dayData = cls.schedule?.find((s) => s.day === day);
                  return (
                    <div
                      key={day}
                      className="p-4 bg-white hover:bg-slate-50/50 transition-colors"
                    >
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        {day}
                      </p>
                      <div className="space-y-3">
                        {dayData?.periods.map((p, idx) => (
                          <div
                            key={idx}
                            className="group p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all relative"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {p.time.split(" - ")[0]}
                              </span>
                              <button
                                onClick={() =>
                                  handleOpenEditor(cls, p, day, idx)
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-md"
                              >
                                <Edit3 className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                            <h4 className="text-[13px] font-bold text-slate-800 leading-tight">
                              {p.subjectName}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />{" "}
                              {teachers.find(
                                (t) => t._id === (p.teacher?._id || p.teacher)
                              )?.name || "TBA"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* --- DAILY GLANCE CONTENT --- */}
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const today = WEEKDAYS[new Date().getDay() - 1] || "Monday";
              const todayPeriods =
                cls.schedule?.find((s) => s.day === today)?.periods || [];
              return (
                <div
                  key={cls._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-md font-bold text-slate-800">
                      {cls.name}
                    </h3>
                    <Badge variant="secondary" className="rounded-lg">
                      {today}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {todayPeriods.length > 0 ? (
                      todayPeriods.map((p, i) => (
                        <div
                          key={i}
                          className="flex gap-4 items-center p-3 border-l-4 border-indigo-500 bg-slate-50 rounded-r-xl"
                        >
                          <div className="text-[11px] font-bold text-slate-400 min-w-[50px]">
                            {p.time.split(" - ")[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 leading-none">
                              {p.subjectName}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {
                                teachers.find(
                                  (t) => t._id === (p.teacher?._id || p.teacher)
                                )?.name
                              }
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-sm italic">
                        No classes today.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* --- TEACHER WORKLOAD SUMMARY --- */}
        <TabsContent value="workload">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Faculty Utilization
              </h3>
              <p className="text-sm text-slate-500">
                Total periods assigned per week across all classes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teachers.map((t) => {
                const count = teacherWorkload[t._id] || 0;
                return (
                  <div
                    key={t._id}
                    className="p-4 border rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {t.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {t.subject || "Faculty"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 leading-none">
                        {count}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        PERIODS
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- EDITOR DIALOG --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <DialogTitle className="text-lg font-bold">
              {editMode ? "Refine Session" : "New Allocation"}
            </DialogTitle>
            <Badge variant="outline" className="text-white border-white/20">
              {selectedClass?.name}
            </Badge>
          </div>

          <div className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Day
                </label>
                <Select
                  value={formData.day}
                  onValueChange={(v) => setFormData({ ...formData, day: v })}
                >
                  <SelectTrigger className="rounded-xl bg-slate-50 border-none font-bold">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Time
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(v) => setFormData({ ...formData, time: v })}
                >
                  <SelectTrigger className="rounded-xl bg-slate-50 border-none font-bold">
                    <SelectValue placeholder="Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                Subject
              </label>
              <Select
                value={formData.subjectId}
                onValueChange={(v) =>
                  setFormData({ ...formData, subjectId: v })
                }
              >
                <SelectTrigger className="rounded-xl bg-slate-50 border-none font-bold h-12">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                Faculty Member
              </label>
              <Select
                value={formData.teacherId}
                onValueChange={(v) =>
                  setFormData({ ...formData, teacherId: v })
                }
              >
                <SelectTrigger className="rounded-xl bg-slate-50 border-none font-bold h-12">
                  <SelectValue placeholder="Assign Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {conflict && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-rose-600 font-bold text-xs">
                    Teacher Conflict Detected
                  </p>
                  <p className="text-rose-500/80 text-[11px]">
                    Occupied in <b>{conflict}</b> during this slot.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-slate-50">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl text-slate-400 font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={!!conflict}
              onClick={savePeriod}
              className="rounded-xl px-8 bg-slate-900 font-bold shadow-lg shadow-slate-200"
            >
              {editMode ? "Save Changes" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
