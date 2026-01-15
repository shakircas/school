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
  ShieldAlert,
  Search,
  CheckCircle2,
  Info,
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

  /* --- DELETE LOGIC --- */
  const deletePeriod = async (cls, day, index) => {
    if (!confirm("Are you sure you want to delete this period?")) return;
    try {
      const sch = structuredClone(cls.schedule || []);
      const dayData = sch.find((x) => x.day === day);
      if (dayData) {
        dayData.periods.splice(index, 1);
        const res = await fetch(`/api/academics/timetable/${cls._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule: sch }),
        });
        if (res.ok) {
          toast.success("Period removed");
          mutate();
        }
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  /* --- WORKLOAD LOGIC --- */
  const teacherWorkload = useMemo(() => {
    const stats = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((day) => {
        day.periods.forEach((p) => {
          const tId = p.teacher?._id || p.teacher;
          if (tId) stats[tId] = (stats[tId] || 0) + 1;
        });
      });
    });
    return stats;
  }, [classes]);

  /* --- GLOBAL CONFLICT SCANNER --- */
  const globalConflicts = useMemo(() => {
    const conflicts = [];
    const scheduleMap = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((day) => {
        day.periods.forEach((p) => {
          const tId = p.teacher?._id || p.teacher;
          if (!tId) return;
          const key = `${day.day}-${p.time}-${tId}`;
          if (scheduleMap[key]) {
            conflicts.push({
              teacher: teachers.find((t) => t._id === tId)?.name || "Unknown",
              day: day.day,
              time: p.time,
              classA: scheduleMap[key].className,
              classB: cls.name,
            });
          } else {
            scheduleMap[key] = { className: cls.name };
          }
        });
      });
    });
    return conflicts;
  }, [classes, teachers]);

  /* --- IN-EDITOR CONFLICT CHECK --- */
  const currentConflict = useMemo(() => {
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
    if (currentConflict)
      return toast.error(`Conflict! Teacher is busy in ${currentConflict}`);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Control Center
          </h1>
          <p className="text-sm text-indigo-600 font-bold">
            2026 Academic Session
          </p>
        </div>
        {globalConflicts.length > 0 && (
          <Badge className="bg-rose-600 text-white animate-pulse px-4 py-2 rounded-full border-none font-bold">
            <ShieldAlert className="w-4 h-4 mr-2" /> {globalConflicts.length}{" "}
            Conflicts
          </Badge>
        )}
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="bg-slate-100 border p-1 rounded-2xl mb-8 shadow-inner flex-wrap h-auto">
          <TabsTrigger
            value="grid"
            className="rounded-xl px-5 py-2.5 gap-2 font-bold"
          >
            <LayoutGrid className="w-4 h-4" /> Weekly Grid
          </TabsTrigger>
          <TabsTrigger
            value="daily"
            className="rounded-xl px-5 py-2.5 gap-2 font-bold"
          >
            <Calendar className="w-4 h-4" /> Daily Glance
          </TabsTrigger>
          <TabsTrigger
            value="workload"
            className="rounded-xl px-5 py-2.5 gap-2 font-bold"
          >
            <BarChart3 className="w-4 h-4" /> Workload
          </TabsTrigger>
          <TabsTrigger
            value="conflicts"
            className="rounded-xl px-5 py-2.5 gap-2 font-bold text-rose-600 active:bg-rose-100"
          >
            <ShieldAlert className="w-4 h-4" /> Conflicts
          </TabsTrigger>
        </TabsList>

        {/* --- GRID VIEW --- */}
        <TabsContent value="grid" className="space-y-10">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
                <h2 className="text-lg font-black text-white tracking-widest uppercase">
                  {cls.name}
                </h2>
                <Button
                  onClick={() => handleOpenEditor(cls)}
                  size="sm"
                  className="rounded-full bg-indigo-500 hover:bg-indigo-400 font-bold px-6 border-none"
                >
                  <Plus className="w-4 h-4 mr-2" /> New Entry
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 divide-x-2 divide-slate-50">
                {WEEKDAYS.map((day) => {
                  const dayData = cls.schedule?.find((s) => s.day === day);
                  return (
                    <div key={day} className="p-4 bg-white">
                      <p className="text-[11px] font-black text-slate-400 uppercase mb-4 text-center tracking-tighter">
                        {day}
                      </p>
                      <div className="space-y-3">
                        {dayData?.periods.map((p, idx) => (
                          <div
                            key={idx}
                            className="group p-3 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-500 rounded-2xl transition-all shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black text-indigo-600">
                                {p.time.split(" - ")[0]}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    handleOpenEditor(cls, p, day, idx)
                                  }
                                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deletePeriod(cls, day, idx)}
                                  className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <h4 className="text-[13px] font-black text-slate-800 leading-tight">
                              {p.subjectName}
                            </h4>
                            <p className="text-[11px] font-bold text-slate-500 mt-1">
                              {
                                teachers.find(
                                  (t) => t._id === (p.teacher?._id || p.teacher)
                                )?.name
                              }
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

        {/* --- FIXED DAILY GLANCE --- */}
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const todayName = WEEKDAYS[new Date().getDay() - 1] || "Monday";
              const todayPeriods =
                cls.schedule?.find((s) => s.day === todayName)?.periods || [];
              return (
                <div
                  key={cls._id}
                  className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-lg shadow-slate-100"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900">
                      {cls.name}
                    </h3>
                    <Badge className="bg-indigo-100 text-indigo-700 font-bold">
                      {todayName}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {todayPeriods.length > 0 ? (
                      todayPeriods.map((p, i) => (
                        <div
                          key={i}
                          className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border-l-4 border-indigo-600"
                        >
                          <div className="text-[11px] font-black text-indigo-600 w-12">
                            {p.time.split(" - ")[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none">
                              {p.subjectName}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tight">
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
                      <div className="text-center py-10 text-slate-400 font-bold italic">
                        No schedule for {todayName}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* --- WORKLOAD --- */}
        <TabsContent value="workload">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {teachers.map((t) => {
              const count = teacherWorkload[t._id] || 0;
              const isOver = count > 15;
              return (
                <div
                  key={t._id}
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    isOver
                      ? "bg-rose-50 border-rose-200"
                      : "bg-white border-slate-100 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <Badge className={isOver ? "bg-rose-600" : "bg-indigo-600"}>
                      {count} Slots
                    </Badge>
                  </div>
                  <h4 className="text-md font-black text-slate-900">
                    {t.name}
                  </h4>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {t.subject || "Faculty"}
                  </p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* --- CONFLICTS LIST --- */}
        <TabsContent value="conflicts">
          <div className="bg-white rounded-3xl border-2 border-slate-50 shadow-xl p-8">
            {globalConflicts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {globalConflicts.map((conf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-5 bg-rose-50 rounded-2xl border-2 border-rose-100"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white">
                        <ShieldAlert />
                      </div>
                      <div>
                        <p className="text-sm font-black text-rose-900">
                          {conf.teacher}
                        </p>
                        <p className="text-xs font-bold text-rose-700">
                          {conf.day} | {conf.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-rose-600">{conf.classA}</Badge>
                      <Badge className="bg-rose-600">{conf.classB}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-emerald-500">
                <CheckCircle2 className="w-16 h-16 mb-4" />
                <p className="text-xl font-black">All Clear!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- EDITOR DIALOG --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-xl font-black">
              {editMode ? "Edit Session" : "Assign Session"}
            </DialogTitle>
            <p className="text-indigo-400 text-xs font-black mt-1 uppercase tracking-widest">
              {selectedClass?.name}
            </p>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Day
                </label>
                <Select
                  value={formData.day}
                  onValueChange={(v) => setFormData({ ...formData, day: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((d) => (
                      <SelectItem key={d} value={d} className="font-bold">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Time
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(v) => setFormData({ ...formData, time: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t} className="font-bold">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Subject
              </label>
              <Select
                value={formData.subjectId}
                onValueChange={(v) =>
                  setFormData({ ...formData, subjectId: v })
                }
              >
                <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id} className="font-bold">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Teacher
              </label>
              <Select
                value={formData.teacherId}
                onValueChange={(v) =>
                  setFormData({ ...formData, teacherId: v })
                }
              >
                <SelectTrigger className="rounded-2xl bg-slate-100 border-none font-black h-12 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id} className="font-bold">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentConflict && (
              <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <p className="text-xs text-rose-700 font-black tracking-tight">
                  Teacher Busy in {currentConflict}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="p-8 bg-slate-50">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="font-black text-slate-400"
            >
              Cancel
            </Button>
            <Button
              disabled={!!currentConflict}
              onClick={savePeriod}
              className="rounded-2xl px-10 bg-slate-900 font-black h-12 shadow-lg shadow-slate-200"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
