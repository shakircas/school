"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Users,
  Clock,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { toast } from "sonner";

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
    fetcher
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
  const [editorSubjectName, setEditorSubjectName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const dragRef = useRef(null);

  const selectedClass = useMemo(
    () => classes.find((c) => c._id === selectedClassId),
    [classes, selectedClassId]
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
    ignoreIdx = null
  ) => {
    return classes.some((cls) =>
      cls.schedule?.some(
        (d) =>
          d.day === day &&
          d.periods.some((p, idx) => {
            const isSameTeacher = getTeacherId(p.teacher) === teacherId;
            const isSameTime = p.time === time;
            const isNotSelf = !(
              cls._id === currentClassId && idx === ignoreIdx
            );
            return isSameTeacher && isSameTime && isNotSelf;
          })
      )
    );
  };

  /* ================= DRAG & DROP ================= */
  const onDragStart = (day, index) => {
    dragRef.current = { day, index };
  };

  const onDrop = async (toDay) => {
    const dragged = dragRef.current;
    if (!dragged || !selectedClassId) return;
    if (dragged.day === toDay) return; // Dropped in same column

    const sch = structuredClone(workSchedule);
    const fromDayObj = sch.find((x) => x.day === dragged.day);
    let toDayObj = sch.find((x) => x.day === toDay);

    if (!toDayObj) {
      toDayObj = { day: toDay, periods: [] };
      sch.push(toDayObj);
    }

    const movedPeriod = fromDayObj.periods[dragged.index];
    const teacherId = getTeacherId(movedPeriod.teacher);

    // Conflict check before allowing drop
    const hasConflict = checkGlobalConflict(
      teacherId,
      toDay,
      movedPeriod.time,
      selectedClassId
    );

    if (hasConflict) {
      dragRef.current = null;
      return toast.error("Schedule Conflict", {
        description:
          "This teacher is already busy in another class on this day/time.",
      });
    }

    // Move period
    fromDayObj.periods.splice(dragged.index, 1);
    toDayObj.periods.push(movedPeriod);

    // Optimistic UI Update
    setWorkSchedule(sch);
    dragRef.current = null;

    try {
      await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, schedule: sch }),
      });
      toast.success(`Moved to ${toDay}`);
      mutate();
    } catch (err) {
      toast.error("Failed to sync change");
      mutate();
    }
  };

  /* ================= CRUD ================= */
  const openAdd = (day) => {
    setEditorDay(day);
    setEditorTime("");
    setEditorSubjectId("");
    setEditorSubjectName("");
    setEditorTeacher("");
    setEditingIndex(null);
    setIsEditorOpen(true);
  };

  const openEdit = (day, index) => {
    const p = workSchedule.find((d) => d.day === day).periods[index];
    setEditorDay(day);
    setEditorTime(p.time);
    setEditorSubjectId(p.subjectId || "");
    setEditorSubjectName(p.subjectName || p.subject || "");
    setEditorTeacher(getTeacherId(p.teacher));
    setEditingIndex(index);
    setIsEditorOpen(true);
  };

  const savePeriod = async () => {
    if (!editorDay || !editorTime || !editorSubjectId || !editorTeacher)
      return toast.error("Please fill all fields");

    if (
      checkGlobalConflict(
        editorTeacher,
        editorDay,
        editorTime,
        selectedClassId,
        editingIndex
      )
    ) {
      return toast.error("Teacher Conflict Detected");
    }

    const safeSubjectName =
      subjects.find((s) => s._id === editorSubjectId)?.name ||
      editorSubjectName;

    try {
      if (editingIndex !== null) {
        await fetch(`/api/academics/timetable/${selectedClassId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day: editorDay,
            index: editingIndex,
            time: editorTime,
            subjectId: editorSubjectId,
            subjectName: safeSubjectName,
            teacher: editorTeacher,
          }),
        });
      } else {
        const sch = structuredClone(workSchedule);
        let dayObj = sch.find((d) => d.day === editorDay);
        if (!dayObj) {
          dayObj = { day: editorDay, periods: [] };
          sch.push(dayObj);
        }
        dayObj.periods.push({
          time: editorTime,
          subjectId: editorSubjectId,
          subjectName: safeSubjectName,
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
    } catch {
      toast.error("Sync failed");
    }
  };

  const deletePeriod = async (day, index) => {
    if (!confirm("Remove this period?")) return;
    await fetch(`/api/academics/timetable/${selectedClassId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, index }),
    });
    mutate();
    toast.success("Period Removed");
  };

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse font-bold text-slate-400">
        Loading Workspace...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <LayoutGrid className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Timetable Engine
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Drag periods to reschedule or assign faculty
            </p>
          </div>
        </div>

        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-full lg:w-[240px] h-12 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-2xl">
            {classes.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {WEEKDAYS.map((day) => {
          const d = workSchedule.find((x) => x.day === day) || {
            day,
            periods: [],
          };
          return (
            <div
              key={day}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(day)}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">
                  {day}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openAdd(day)}
                  className="rounded-full"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="min-h-[500px] bg-slate-100/50 rounded-[2rem] p-3 border-2 border-dashed border-slate-200/60 space-y-3">
                <AnimatePresence mode="popLayout">
                  {d.periods.map((p, i) => (
                    <motion.div
                      layout
                      draggable
                      onDragStart={() => onDragStart(day, i)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={`${day}-${i}`}
                      className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:ring-2 hover:ring-indigo-500/20 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                          {p.time.split(" - ")[0]}
                        </div>
                        <GripVertical className="h-4 w-4 text-slate-300" />
                      </div>

                      <h4 className="font-bold text-slate-900 leading-tight mb-1">
                        {p.subjectName || p.subject}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-500 mb-4 text-[11px]">
                        <Users className="h-3 w-3" />
                        <span className="truncate italic">
                          {teachers?.find(
                            (t) => t._id === getTeacherId(p.teacher)
                          )?.name || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-full rounded-lg text-[11px]"
                          onClick={() => openEdit(day, i)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-10 text-rose-500"
                          onClick={() => deletePeriod(day, i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {d.periods.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-300 opacity-20">
                    <Clock className="h-8 w-8 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Free
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EDITOR DIALOG */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-600 p-6 text-white">
            <DialogTitle className="text-xl font-black">
              {editingIndex !== null ? "Edit Period" : "New Period"}
            </DialogTitle>
          </div>

          <div className="p-6 space-y-4 bg-white">
            {/* Real-time Conflict Banner */}
            {(() => {
              const conflict = classes.find((cls) =>
                cls.schedule?.some(
                  (d) =>
                    d.day === editorDay &&
                    d.periods.some(
                      (p, idx) =>
                        getTeacherId(p.teacher) === editorTeacher &&
                        p.time === editorTime &&
                        !(cls._id === selectedClassId && idx === editingIndex)
                    )
                )
              );
              if (conflict && editorTeacher && editorTime) {
                return (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 overflow-hidden"
                  >
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <p className="text-[11px] text-rose-600 font-medium">
                      Conflict: This teacher is already at{" "}
                      <strong>{conflict.name}</strong> during this slot.
                    </p>
                  </motion.div>
                );
              }
              return null;
            })()}

            <div className="grid grid-cols-2 gap-4">
              <Select value={editorDay} onValueChange={setEditorDay}>
                <SelectTrigger className="rounded-xl">
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
              <Select value={editorTime} onValueChange={setEditorTime}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Time" />
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

            <Select
              value={editorSubjectId}
              onValueChange={(val) => {
                setEditorSubjectId(val);
                setEditorSubjectName(
                  subjects.find((s) => s._id === val)?.name || ""
                );
              }}
            >
              <SelectTrigger className="rounded-xl h-12">
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

            <Select value={editorTeacher} onValueChange={setEditorTeacher}>
              <SelectTrigger className="rounded-xl h-12">
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

          <DialogFooter className="p-6 bg-slate-50 flex gap-2">
            <Button
              variant="ghost"
              className="rounded-xl font-bold"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={savePeriod}
              className="rounded-xl bg-indigo-600 px-8 font-bold"
            >
              Save Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
