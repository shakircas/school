"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Users,
  Clock,
  CalendarDays,
  MoreVertical,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const fetcher = (url) => fetch(url).then((r) => r.json());

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

export default function TimetableBuilder() {
  const { data, isLoading, mutate } = useSWR(
    "/api/academics/timetable",
    fetcher,
  );
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const classes = data?.data || [];
  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsRes?.data || [];

  const [selectedClassId, setSelectedClassId] = useState("");
  const [workSchedule, setWorkSchedule] = useState([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Editor State
  const [editorDay, setEditorDay] = useState("");
  const [editorTime, setEditorTime] = useState("");
  const [editorTeacher, setEditorTeacher] = useState("");
  const [editorSubjectId, setEditorSubjectId] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const dragRef = useRef(null);
  const printRef = useRef(null);
  const selectedClass = useMemo(
    () => classes.find((c) => c._id === selectedClassId),
    [classes, selectedClassId],
  );

  useEffect(() => {
    if (selectedClass?.schedule)
      setWorkSchedule(structuredClone(selectedClass.schedule));
    else setWorkSchedule([]);
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClassId && classes.length) setSelectedClassId(classes[0]._id);
  }, [classes, selectedClassId]);

  /* ================= UTILS ================= */
  const getTeacherId = (teacher) =>
    typeof teacher === "object" ? teacher?._id : teacher;

  const checkGlobalConflict = (
    teacherId,
    day,
    time,
    currentClassId,
    ignoreIdx = null,
  ) => {
    return classes.some((cls) =>
      cls.schedule?.some(
        (d) =>
          d.day === day &&
          d.periods.some((p, idx) => {
            const isSameTeacher = getTeacherId(p.teacher) === teacherId;
            const isSameTime = p.time === time;
            const isNotSelf = !(
              cls._id === currentClassId &&
              d.day === editorDay &&
              idx === ignoreIdx
            );
            return isSameTeacher && isSameTime && isNotSelf;
          }),
      ),
    );
  };

  const teacherWorkload = useMemo(() => {
    const stats = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((day) => {
        day.periods?.forEach((p) => {
          const tId = getTeacherId(p.teacher);
          if (tId) stats[tId] = (stats[tId] || 0) + 1;
        });
      });
    });
    return stats;
  }, [classes]);

  /* ================= CRUD ACTIONS ================= */
  const openAdd = (day, time) => {
    setEditorDay(day);
    setEditorTime(time);
    setEditorSubjectId("");
    setEditorTeacher("");
    setEditingIndex(null);
    setIsEditorOpen(true);
  };

  const openEdit = (day, index) => {
    const dayObj = workSchedule.find((d) => d.day === day);
    const p = dayObj.periods[index];
    setEditorDay(day);
    setEditorTime(p.time);
    setEditorSubjectId(p.subjectId || "");
    setEditorTeacher(getTeacherId(p.teacher));
    setEditingIndex(index);
    setIsEditorOpen(true);
  };

  const deletePeriod = async (day, index) => {
    if (!confirm("Remove this period?")) return;
    try {
      await fetch(`/api/academics/timetable/${selectedClassId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, index }),
      });
      mutate();
      toast.success("Period Removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const savePeriod = async () => {
    if (!editorDay || !editorTime || !editorSubjectId || !editorTeacher)
      return toast.error("Fill all fields");

    if (
      checkGlobalConflict(
        editorTeacher,
        editorDay,
        editorTime,
        selectedClassId,
        editingIndex,
      )
    ) {
      return toast.error("Teacher Conflict", {
        description: "Teacher is already busy at this time.",
      });
    }

    const subjectName = subjects.find((s) => s._id === editorSubjectId)?.name;
    const sch = structuredClone(workSchedule);

    if (editingIndex !== null) {
      // Patch Existing
      await fetch(`/api/academics/timetable/${selectedClassId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: editorDay,
          index: editingIndex,
          time: editorTime,
          subjectId: editorSubjectId,
          subjectName,
          teacher: editorTeacher,
        }),
      });
    } else {
      // Create New
      let dayObj = sch.find((d) => d.day === editorDay) || {
        day: editorDay,
        periods: [],
      };
      if (!sch.find((d) => d.day === editorDay)) sch.push(dayObj);
      dayObj.periods.push({
        time: editorTime,
        subjectId: editorSubjectId,
        subjectName,
        teacher: editorTeacher,
      });

      await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, schedule: sch }),
      });
    }
    setIsEditorOpen(false);
    mutate();
    toast.success("Timetable Updated");
  };

  /* ================= EXPORT & DND ================= */
  const exportPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedClass?.name || "Timetable"}.pdf`);
  };

  const onDragStart = (day, index) => {
    dragRef.current = { day, index };
  };
  const onDrop = async (toDay, toTime) => {
    const dragged = dragRef.current;
    if (!dragged || !selectedClassId) return;
    const sch = structuredClone(workSchedule);
    const movedPeriod = sch.find((x) => x.day === dragged.day).periods[
      dragged.index
    ];

    if (
      checkGlobalConflict(
        getTeacherId(movedPeriod.teacher),
        toDay,
        toTime,
        selectedClassId,
      )
    ) {
      return toast.error("Conflict detected at destination");
    }

    sch.find((x) => x.day === dragged.day).periods.splice(dragged.index, 1);
    let toDayObj = sch.find((x) => x.day === toDay) || {
      day: toDay,
      periods: [],
    };
    if (!sch.find((x) => x.day === toDay)) sch.push(toDayObj);
    toDayObj.periods.push({ ...movedPeriod, time: toTime });

    setWorkSchedule(sch);
    await fetch("/api/academics/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClassId, schedule: sch }),
    });
    mutate();
    dragRef.current = null;
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse text-indigo-600 font-black">
        LOADING GRID...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
            <CalendarDays className="text-white h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Master Scheduler
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full md:w-[240px] h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={exportPDF}
            variant="outline"
            className="rounded-xl h-12 border-indigo-100 text-indigo-600 font-bold gap-2"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </header>

      <div
        className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden"
        ref={printRef}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1200px] grid grid-cols-[140px_repeat(7,1fr)]">
            <div className="bg-slate-50 p-6 border-b border-r border-slate-100 font-black text-slate-400 text-[10px] uppercase">
              Days \ Time
            </div>
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="bg-slate-50 p-6 border-b border-r border-slate-100 text-center font-bold text-slate-600 text-sm"
              >
                {time}
              </div>
            ))}

            {WEEKDAYS.map((day) => (
              <Fragment key={day}>
                <div className="bg-slate-50/50 p-6 border-b border-r border-slate-100 font-black text-slate-800 text-sm flex items-center">
                  {day}
                </div>
                {TIME_SLOTS.map((time) => {
                  const dayData = workSchedule.find((d) => d.day === day);
                  const periodIndex = dayData?.periods?.findIndex(
                    (p) => p.time === time,
                  );
                  const period =
                    periodIndex !== undefined && periodIndex !== -1
                      ? dayData?.periods[periodIndex]
                      : null;

                  return (
                    <div
                      key={`${day}-${time}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(day, time)}
                      className={cn(
                        "p-2 border-b border-r border-slate-50 min-h-[140px] relative group transition-colors",
                        !period && "hover:bg-indigo-50/50 cursor-pointer",
                      )}
                      onClick={() => !period && openAdd(day, time)}
                    >
                      {period ? (
                        <motion.div
                          draggable
                          onDragStart={() => onDragStart(day, periodIndex)}
                          className="bg-white h-full w-full rounded-2xl p-4 shadow-sm ring-1 ring-slate-100 cursor-grab active:cursor-grabbing touch-none relative"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="p-1.5 bg-indigo-50 rounded-lg">
                              <Clock className="h-3 w-3 text-indigo-600" />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() => openEdit(day, periodIndex)}
                                  className="font-bold text-xs gap-2"
                                >
                                  <Edit className="h-3 w-3" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deletePeriod(day, periodIndex)}
                                  className="font-bold text-xs gap-2 text-rose-500"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 leading-tight mb-1">
                            {period.subjectName}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {
                              teachers.find(
                                (t) => t._id === getTeacherId(period.teacher),
                              )?.name
                            }
                          </p>
                        </motion.div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Plus className="h-5 w-5 text-indigo-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-600 p-8 text-white">
            <DialogTitle className="text-2xl font-black">
              {editingIndex !== null ? "Edit Period" : "New Assignment"}
            </DialogTitle>
            <div className="flex gap-3 mt-3">
              <span className="bg-indigo-500/50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {editorDay}
              </span>
              <span className="bg-indigo-500/50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {editorTime}
              </span>
            </div>
          </div>
          <div className="p-8 space-y-6 bg-white">
            {/* Conflict Alert Banner */}
            {editorTeacher &&
              editorTime &&
              checkGlobalConflict(
                editorTeacher,
                editorDay,
                editorTime,
                selectedClassId,
                editingIndex,
              ) && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 animate-in fade-in zoom-in">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <p className="text-[11px] text-rose-700 font-bold">
                    Teacher is already assigned to another class at this time.
                  </p>
                </div>
              )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">
                Subject
              </label>
              <Select
                value={editorSubjectId}
                onValueChange={setEditorSubjectId}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200">
                  <SelectValue placeholder="Choose Subject" />
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
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">
                Faculty & Workload
              </label>
              <Select value={editorTeacher} onValueChange={setEditorTeacher}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200">
                  <SelectValue placeholder="Assign Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      <div className="flex justify-between items-center w-full gap-4">
                        <span>{t.name}</span>
                        <span
                          className={cn(
                            "text-[9px] px-2 py-0.5 rounded-full font-black",
                            (teacherWorkload[t._id] || 0) > 15
                              ? "bg-rose-100 text-rose-600"
                              : "bg-emerald-100 text-emerald-600",
                          )}
                        >
                          {teacherWorkload[t._id] || 0} PERIODS
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditorOpen(false)}
              className="font-bold text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={savePeriod}
              className="rounded-xl bg-indigo-600 px-8 font-black"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
