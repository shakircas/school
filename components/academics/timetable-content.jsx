"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  LayoutGrid,
  Calendar,
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  Printer,
  Clock,
  BookOpen,
  GraduationCap,
  Download,
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
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { PrintableGrid } from "./PrintableGrid";

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

  const handlePrint = () => window.print();

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
              p.teacher === formData.teacherId),
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
      (s) => s._id === formData.subjectId,
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

  const downloadClassPDF = (classId, className) => {
    const element = document.getElementById(`printable-card-${classId}`);
    const opt = {
      margin: 10,
      filename: `${className}_Timetable_2026.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }, // Landscape fits the grid better
    };

    // Run the conversion
    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      {/* STYLE TAG FOR PRINT OPTIMIZATION */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            page-break-after: always !important;
            margin-bottom: 0 !important;
          }
          .print-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .time-col {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
          }
          .day-header {
            background-color: #1e293b !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl  font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Master Schedule Manager
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> Session 2026 • Real-time Conflict
            Monitoring
          </p>
        </div>
        <div className="flex gap-3">
          {globalConflicts.length > 0 && (
            <Badge
              variant="destructive"
              className="animate-pulse px-4 py-2 rounded-xl text-sm font-bold"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> {globalConflicts.length}{" "}
              Conflicts Found
            </Badge>
          )}
          <Button
            onClick={handlePrint}
            className="rounded-xl font-black gap-2 bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 shadow-sm transition-all h-11"
          >
            <Printer className="w-4 h-4" /> Print Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="classic" className="w-full">
        {/* Scrollable Tabs for Mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <TabsList className="bg-white border p-1 rounded-2xl mb-6 shadow-sm flex w-max sm:w-inline-flex">
            {[
              { value: "classic", icon: LayoutGrid, label: "Classic" },
              { value: "grid", icon: LayoutGrid, label: "Master" },
              { value: "daily", icon: Calendar, label: "Daily" },
              { value: "workload", icon: BarChart3, label: "Workload" },
              {
                value: "conflicts",
                icon: ShieldAlert,
                label: "Conflicts",
                color: "text-rose-600",
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`rounded-xl px-4 py-2 gap-2 font-black text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md border border-transparent data-[state=active]:border-slate-100 ${tab.color || ""}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="classic" className="space-y-6">
          {classes.map((cls) => (
            <PrintableGrid
              key={cls._id}
              cls={cls}
              teachers={teachers}
              onDownload={downloadClassPDF}
              onAddPeriod={(c, p, d, t) => {
                if (d && t) setFormData({ ...formData, day: d, time: t });
                handleOpenEditor(c);
              }}
              onEditPeriod={handleOpenEditor}
              onDeletePeriod={deletePeriod}
            />
          ))}
        </TabsContent>

        <TabsContent value="grid" className="space-y-8">
          {classes.map((cls) => (
            <div
              key={cls._id}
              id={`printable-card-${cls._id}`}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print-card"
            >
              {/* HEADER - Switched to White */}
              <div className="bg-white border-b border-slate-100 px-6 sm:px-10 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <GraduationCap className="text-white w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      {cls.name}
                    </h2>
                    <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
                      Weekly Schedule
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => downloadClassPDF(cls._id, cls.name)}
                    variant="outline"
                    className="flex-1 sm:flex-none rounded-full bg-white text-slate-900 border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    <Download className="w-3 h-3 mr-2" /> Save
                  </Button>
                  <Button
                    onClick={() => handleOpenEditor(cls)}
                    className="flex-1 sm:flex-none rounded-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-6 text-xs transition-all print-hidden"
                  >
                    <Plus className="w-3 h-3 mr-2" /> Add
                  </Button>
                </div>
              </div>

              {/* MATRIX - Responsive Scroll */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white">
                      <th className="p-4 border-b border-r border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest w-32">
                        Time
                      </th>
                      {WEEKDAYS.map((day) => (
                        <th
                          key={day}
                          className="p-4 border-b border-r border-slate-100 text-slate-800 font-black text-xs uppercase"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((time) => (
                      <tr
                        key={time}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="p-4 border-r border-b border-slate-100 font-black text-indigo-600 text-[10px] text-center bg-white">
                          {time}
                        </td>
                        {WEEKDAYS.map((day) => {
                          const period = cls.schedule
                            ?.find((s) => s.day === day)
                            ?.periods.find((p) => p.time === time);
                          const idx = cls.schedule
                            ?.find((s) => s.day === day)
                            ?.periods.indexOf(period);

                          return (
                            <td
                              key={day}
                              className="p-2 border-r border-b border-slate-50 min-w-[150px] h-20 relative transition-all"
                            >
                              {period ? (
                                <div className="h-full w-full p-2 bg-white border border-slate-200 rounded-xl shadow-sm group/period relative flex flex-col justify-center">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl" />
                                  <h4 className="text-[12px] font-black text-slate-800 leading-tight truncate">
                                    {period.subjectName}
                                  </h4>
                                  <p className="text-[10px] font-bold text-slate-500 truncate mt-1">
                                    {
                                      teachers.find(
                                        (t) =>
                                          t._id ===
                                          (period.teacher?._id ||
                                            period.teacher),
                                      )?.name
                                    }
                                  </p>
                                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/period:opacity-100 transition-opacity print-hidden">
                                    <button
                                      onClick={() =>
                                        handleOpenEditor(cls, period, day, idx)
                                      }
                                      className="p-1 bg-white border rounded shadow-sm text-slate-400 hover:text-indigo-600"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center group/empty">
                                  <Plus
                                    className="w-4 h-4 text-slate-200 group-hover/empty:text-indigo-400 cursor-pointer transition-colors print-hidden"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        day,
                                        time,
                                      }));
                                      handleOpenEditor(cls);
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Daily Glance Responsive Cards */}
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const todayName = WEEKDAYS[new Date().getDay() - 1] || "Monday";
              const todayPeriods =
                cls.schedule?.find((s) => s.day === todayName)?.periods || [];
              return (
                <div
                  key={cls._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg shadow-slate-100"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {cls.name}
                      </h3>
                      <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                        {todayName}
                      </p>
                    </div>
                    <BookOpen className="text-slate-300 w-5 h-5" />
                  </div>
                  <div className="space-y-3">
                    {todayPeriods.length > 0 ? (
                      todayPeriods
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((p, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all"
                          >
                            <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                              {p.time.split(" - ")[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">
                                {p.subjectName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 truncate uppercase">
                                {
                                  teachers.find(
                                    (t) =>
                                      t._id === (p.teacher?._id || p.teacher),
                                  )?.name
                                }
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                        No classes today
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="workload">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {teachers.map((t) => {
              const count = teacherWorkload[t._id] || 0;
              const isOver = count > 15;
              return (
                <div
                  key={t._id}
                  className={`p-5 rounded-3xl border transition-all ${isOver ? "bg-white border-rose-200" : "bg-white border-slate-200"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <Badge
                      className={`px-3 py-1 rounded-lg font-black text-[10px] ${isOver ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"}`}
                    >
                      {count} Periods
                    </Badge>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {t.name}
                  </h4>
                  <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${isOver ? "bg-rose-500" : "bg-indigo-500"}`}
                      style={{ width: `${Math.min((count / 25) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="conflicts">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
            {globalConflicts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {globalConflicts.map((conf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 sm:p-6 bg-white border border-rose-100 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                    <div className="flex gap-4 items-center min-w-0">
                      <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                          {conf.teacher}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {conf.day} • {conf.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none text-[10px] px-2">
                        {conf.classA}
                      </Badge>
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none text-[10px] px-2">
                        {conf.classB}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-emerald-500">
                <CheckCircle2 className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-black text-slate-900">
                  Conflict-Free Zone
                </h3>
                <p className="text-slate-400 font-bold text-xs mt-1 text-center">
                  Assignments are perfectly synchronized.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* EDITOR DIALOG - Styled for Elegance */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-10 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              {editMode ? (
                <Edit3 className="text-indigo-400" />
              ) : (
                <Plus className="text-indigo-400" />
              )}
              {editMode ? "Refine Session" : "Schedule New"}
            </DialogTitle>
            <p className="text-indigo-400 text-xs font-black mt-2 uppercase tracking-[0.2em]">
              {selectedClass?.name}
            </p>
          </div>

          <div className="p-10 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Day of Week
                </label>
                <Select
                  value={formData.day}
                  onValueChange={(v) => setFormData({ ...formData, day: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 font-black">
                    {WEEKDAYS.map((d) => (
                      <SelectItem
                        key={d}
                        value={d}
                        className="rounded-xl py-3 cursor-pointer"
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Time Slot
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(v) => setFormData({ ...formData, time: v })}
                >
                  <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Time" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 font-black">
                    {TIME_SLOTS.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="rounded-xl py-3 cursor-pointer"
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Subject Matter
              </label>
              <Select
                value={formData.subjectId}
                onValueChange={(v) =>
                  setFormData({ ...formData, subjectId: v })
                }
              >
                <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 font-black">
                  {subjects.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={s._id}
                      className="rounded-xl py-3 cursor-pointer"
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Assigned Faculty
              </label>
              <Select
                value={formData.teacherId}
                onValueChange={(v) =>
                  setFormData({ ...formData, teacherId: v })
                }
              >
                <SelectTrigger className="rounded-2xl bg-slate-50 border-2 border-slate-100 font-black h-14 text-slate-800 focus:ring-indigo-500">
                  <SelectValue placeholder="Assign Teacher" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 font-black">
                  {teachers.map((t) => (
                    <SelectItem
                      key={t._id}
                      value={t._id}
                      className="rounded-xl py-3 cursor-pointer"
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentConflict && (
              <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                <p className="text-xs text-rose-700 font-black tracking-tight leading-relaxed">
                  Resource Conflict: Teacher is already assigned to{" "}
                  <span className="underline">{currentConflict}</span> during
                  this slot.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="p-10 bg-slate-50 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl font-black text-slate-400 h-14 px-8"
            >
              Discard
            </Button>
            <Button
              disabled={
                !!currentConflict ||
                !formData.day ||
                !formData.time ||
                !formData.subjectId ||
                !formData.teacherId
              }
              onClick={savePeriod}
              className="rounded-2xl px-12 bg-slate-900 font-black h-14 shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all"
            >
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
