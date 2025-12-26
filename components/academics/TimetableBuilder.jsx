// // /components/TimetableBuilder.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Trash2, Edit, GripVertical } from "lucide-react";
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
  /* ================= DATA ================= */
  const { data, isLoading, mutate } = useSWR(
    "/api/academics/timetable",
    fetcher
  );
  console.log(data);
  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const classes = data?.data || [];
  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsRes?.data || [];

  /* ================= STATE ================= */
  const [selectedClassId, setSelectedClassId] = useState("");
  const selectedClass = useMemo(
    () => classes.find((c) => c._id === selectedClassId),
    [classes, selectedClassId]
  );

  const [workSchedule, setWorkSchedule] = useState([]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorDay, setEditorDay] = useState("");
  const [editorTime, setEditorTime] = useState("");
  // const [editorSubject, setEditorSubject] = useState("");
  const [editorTeacher, setEditorTeacher] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editorSubjectId, setEditorSubjectId] = useState("");
  const [editorSubjectName, setEditorSubjectName] = useState("");

  /* ================= INIT ================= */
  useEffect(() => {
    if (selectedClass?.schedule) {
      setWorkSchedule(structuredClone(selectedClass.schedule));
    } else {
      setWorkSchedule([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0]._id);
    }
  }, [classes, selectedClassId]);

  /* ================= HELPERS ================= */
  const ensureDay = (sch, day) => {
    let d = sch.find((x) => x.day === day);
    if (!d) {
      d = { day, periods: [] };
      sch.push(d);
    }
    return d;
  };

  const subjectObj = subjects.find((s) => s._id === editorSubjectId);

  const safeSubjectName =
    subjectObj?.name || editorSubjectName || editorSubjectId || "Unknown Subject";


  /* ================= CRUD ================= */
  const openAdd = (day) => {
    setEditorDay(day);
    setEditorTime("");
    setEditorSubjectId("");
    setEditorSubjectName("");
    // setEditorSubject("");
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
    // setEditorSubject(p.subject);
    setEditorTeacher(p.teacher || "");
    setEditingIndex(index);
    setIsEditorOpen(true);
  };

  /* ================= CLASH CHECK ================= */
  const hasTeacherClash = (teacherId, day, time, ignoreIndex = null) => {
    for (const cls of classes) {
      for (const d of cls.schedule || []) {
        if (d.day !== day) continue;
        for (let i = 0; i < d.periods.length; i++) {
          const p = d.periods[i];
          if (
            p.teacher?._id === teacherId &&
            p.time === time &&
            !(cls._id === selectedClassId && i === ignoreIndex)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const savePeriod = async () => {
    if (!editorDay || !editorTime || !editorSubjectId || !editorTeacher) {
      return toast.error("All fields are required");
    }

    //  if (teacher && hasTeacherClash(teacher, day, time, index)) {
    //    return toast.error("Teacher clash detected!");
    //  }
    const subjectObj = subjects.find((s) => s._id === editorSubjectId);

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
        toast.success("Period updated");
      } else {
        const sch = structuredClone(workSchedule);
        ensureDay(sch, editorDay).periods.push({
          time: editorTime,
          // subject: editorSubject,
          subjectId: editorSubjectId,
          subjectName: subjectObj?.name || editorSubjectName,
          teacher: editorTeacher,
        });

        await fetch("/api/academics/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClassId,
            schedule: sch,
          }),
        });
        toast.success("Period added");
      }

      setIsEditorOpen(false);
      mutate();
    } catch {
      toast.error("Failed to save period");
    }
  };

  const deletePeriod = async (day, index) => {
    if (!confirm("Delete this period?")) return;

    await fetch(`/api/academics/timetable/${selectedClassId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, index }),
    });

    toast.success("Period deleted");
    mutate();
  };

  /* ================= DRAG & DROP ================= */
  const dragRef = useRef(null);

  const onDragStart = (day, index) => {
    dragRef.current = { day, index };
  };

  const onDrop = async (toDay) => {
    const d = dragRef.current;
    if (!d || !selectedClassId) return;

    const sch = structuredClone(workSchedule);

    const from = sch.find((x) => x.day === d.day);
    let to = sch.find((x) => x.day === toDay);

    if (!to) {
      to = { day: toDay, periods: [] };
      sch.push(to);
    }

    const [moved] = from.periods.splice(d.index, 1);
    to.periods.push(moved);

    // if (moved.teacher && hasTeacherClash(moved.teacher, toDay, toTime)) {
    //   toast.error("Teacher clash!");
    //   return;
    // }

    // 1️⃣ Update UI immediately
    setWorkSchedule(sch);
    dragRef.current = null;

    // 2️⃣ Persist to server
    try {
      await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          schedule: sch,
        }),
      });

      toast.success("Timetable updated");
      mutate(); // revalidate from server
    } catch (err) {
      toast.error("Failed to save drag change");
    }
  };

  /* ================= UI ================= */
  if (isLoading) return <div>Loading timetable...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timetable Builder</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex gap-4 mb-4 items-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                className="border rounded-lg p-3 bg-slate-50"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{day}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openAdd(day)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {d.periods.map((p, i) => (
                  <div
                    key={`${day}-${i}`}
                    draggable
                    onDragStart={() => onDragStart(day, i)}
                    className="bg-white border rounded p-2 mb-2 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {p.subjectName || p.subject}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.time} •{" "}
                          {teachers?.find((t) => t._id === p.teacher)?.name ||
                            p.teacher.name ||
                            "Unassigned"}
                        </div>
                      </div>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(day, i)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => deletePeriod(day, i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Editor */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Period" : "Add Period"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Select value={editorDay} onValueChange={setEditorDay}>
              <SelectTrigger>
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
              <SelectTrigger>
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

            {/* <Select value={editorSubject} onValueChange={setEditorSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            <Select
              value={editorSubjectId}
              onValueChange={(val) => {
                setEditorSubjectId(val);
                const s = subjects.find((x) => x._id === val);
                setEditorSubjectName(s?.name || "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
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
              <SelectTrigger>
                <SelectValue placeholder="Teacher" />
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePeriod}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
