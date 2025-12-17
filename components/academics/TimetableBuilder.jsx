// /components/TimetableBuilder.jsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import useSWR from "swr";
import { useOfflineResource } from "@/lib/offline-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Plus, Trash2, Edit, Drag, User } from "lucide-react";
import { toast } from "sonner";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const fetcher = (url) => fetch(url).then((r) => r.json());

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function TimetableBuilder() {
  // classes come from server but we also use offline resource for save
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];

  // offline resource wrapper for classes (schedule is inside class doc)
  const {
    items: localClasses,
    loading,
    saveItem,
    refreshFromServer,
    online,
    forceSync,
  } = useOfflineResource("classes");

  // select class to edit
  const [selectedClassId, setSelectedClassId] = useState(null);
  const selectedClass = useMemo(
    () =>
      localClasses.find((c) => c._id === selectedClassId) ||
      classes.find((c) => c._id === selectedClassId),
    [localClasses, classes, selectedClassId]
  );

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorDay, setEditorDay] = useState(WEEKDAYS[0]);
  const [editorTime, setEditorTime] = useState("");
  const [editorSubject, setEditorSubject] = useState("");
  const [editorTeacher, setEditorTeacher] = useState("");
  const [editingPeriod, setEditingPeriod] = useState(null);

  // local schedule working copy for editing so UI feels instant
  const [workSchedule, setWorkSchedule] = useState([]);

  useEffect(() => {
    if (selectedClass) {
      setWorkSchedule(
        selectedClass.schedule
          ? JSON.parse(JSON.stringify(selectedClass.schedule))
          : []
      );
    } else {
      setWorkSchedule([]);
    }
  }, [selectedClassId, selectedClass]);

  // helpers
  const ensureDay = (sch, day) => {
    const s = sch.find((d) => d.day === day);
    if (!s) {
      sch.push({ day, periods: [] });
    }
  };

  const openAdd = (day) => {
    setEditorDay(day);
    setEditorTime("");
    setEditorSubject("");
    setEditorTeacher("");
    setEditingPeriod(null);
    setIsEditorOpen(true);
  };

  const onAddOrUpdate = () => {
    if (!editorTime || !editorSubject) {
      toast.error("Time and Subject are required");
      return;
    }
    const sch = Array.isArray(workSchedule) ? [...workSchedule] : [];
    ensureDay(sch, editorDay);
    const dayObj = sch.find((d) => d.day === editorDay);

    if (editingPeriod) {
      // update period in place (editingPeriod stores { day, index })
      dayObj.periods[editingPeriod.index] = {
        ...dayObj.periods[editingPeriod.index],
        time: editorTime,
        subject: editorSubject,
        teacher: editorTeacher || "",
      };
      toast.success("Period updated (local)");
    } else {
      dayObj.periods.push({
        _id: uid(),
        time: editorTime,
        subject: editorSubject,
        teacher: editorTeacher || "",
      });
      toast.success("Period added (local)");
    }

    setWorkSchedule(sch);
    setIsEditorOpen(false);
  };

  const onEditPeriod = (day, index) => {
    const dayObj = workSchedule.find((d) => d.day === day);
    const p = dayObj.periods[index];
    setEditorDay(day);
    setEditorTime(p.time);
    setEditorSubject(p.subject);
    setEditorTeacher(p.teacher || "");
    setEditingPeriod({ day, index });
    setIsEditorOpen(true);
  };

  const onDeletePeriod = (day, index) => {
    if (!confirm("Delete this period?")) return;
    const sch = workSchedule.map((d) => ({
      day: d.day,
      periods: [...d.periods],
    }));
    const dayObj = sch.find((d) => d.day === day);
    dayObj.periods.splice(index, 1);
    setWorkSchedule(sch);
    toast.success("Period removed (local)");
  };

  // Drag & Drop (native)
  const dragData = useRef(null);

  const onDragStart = (e, fromDay, index) => {
    dragData.current = { fromDay, index };
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropToDay = (e, toDay) => {
    e.preventDefault();
    const d = dragData.current;
    if (!d) return;
    if (d.fromDay === toDay && d.index == null) return;

    const sch = workSchedule.map((dd) => ({
      day: dd.day,
      periods: [...dd.periods],
    }));
    ensureDay(sch, d.fromDay);
    ensureDay(sch, toDay);

    const from = sch.find((x) => x.day === d.fromDay);
    const to = sch.find((x) => x.day === toDay);

    const [moved] = from.periods.splice(d.index, 1);
    to.periods.push(moved);

    setWorkSchedule(sch);
    dragData.current = null;
    toast.success("Period moved (local)");
  };

  const onAllowDrop = (e) => e.preventDefault();

  // persist schedule to server (or offline queue)
  const saveSchedule = async () => {
    if (!selectedClassId) return toast.error("Select a class first");
    const payload = {
      classId: selectedClassId,
      schedule: workSchedule,
    };

    try {
      // Use offline wrapper: saveItem will switch to offline queue if offline
      await saveItem(payload);
      // saveItem expects object to be for store 'classes' — our hook expects saveItem to accept full class doc
      // some servers expect POST /api/academics/timetable — but our offline resource uses /api/classes endpoint
      // To be safe we call the timetable API first (server canonical)
      if (navigator.onLine) {
        const res = await fetch("/api/academics/timetable/timetableBuilder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Save failed");
        // refresh local copy
        await refreshFromServer();
        toast.success("Schedule saved (server)");
      } else {
        // offline: rely on saveItem to queue
        await saveItem({ _id: selectedClassId, schedule: workSchedule });
        toast.success("Schedule saved (offline, queued)");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save schedule");
    }
  };

  // If offline, allow user to force sync when back online
  const { online: isOnline } = (function useFakeOnline() {
    // quick inline online detection
    const [on, setOn] = useState(
      typeof navigator !== "undefined" ? navigator.onLine : true
    );
    useEffect(() => {
      const onOnline = () => setOn(true);
      const onOffline = () => setOn(false);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      return () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }, []);
    return { online: on };
  })();

  // sync to server when back online automatically
  useEffect(() => {
    if (isOnline) {
      // optionally refresh server copy
      refreshFromServer();
    }
  }, [isOnline, refreshFromServer]);

  // If there is no selected class, pick first
  useEffect(() => {
    if (!selectedClassId && (localClasses?.length || classes?.length)) {
      const first =
        localClasses && localClasses.length ? localClasses[0] : classes[0];
      if (first) setSelectedClassId(first._id);
    }
  }, [localClasses, classes, selectedClassId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timetable Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center mb-4">
            <div className="w-64">
              <label className="block text-sm font-medium text-muted-foreground">
                Select Class
              </label>
              <select
                className="mt-1 block w-full rounded border px-3 py-2"
                value={selectedClassId || ""}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- select class --</option>
                {localClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.academicYear ? `(${c.academicYear})` : ""}
                  </option>
                ))}
                {classes
                  .filter((c) => !localClasses.find((lc) => lc._id === c._id))
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.academicYear ? `(${c.academicYear})` : ""}
                    </option>
                  ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => refreshFromServer()}>
                Refresh
              </Button>
              <Button onClick={saveSchedule}>Save Schedule</Button>
            </div>
          </div>

          {!selectedClass ? (
            <div className="text-sm text-muted-foreground">
              Choose a class to begin editing timetable
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {WEEKDAYS.map((d) => {
                const dayObj = workSchedule.find((s) => s.day === d) || {
                  day: d,
                  periods: [],
                };
                return (
                  <div
                    key={d}
                    onDrop={(e) => onDropToDay(e, d)}
                    onDragOver={onAllowDrop}
                    className="p-3 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{d}</h3>
                      <div className="flex gap-1">
                        <button
                          className="text-xs text-primary"
                          onClick={() => openAdd(d)}
                        >
                          <Plus className="inline w-4 h-4 mr-1" /> Add
                        </button>
                      </div>
                    </div>

                    {dayObj.periods.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No periods
                      </div>
                    ) : (
                      dayObj.periods.map((p, i) => (
                        <div
                          key={p._id || `${d}-${i}`}
                          draggable
                          onDragStart={(e) => onDragStart(e, d, i)}
                          className="mb-2 p-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 border flex justify-between items-center"
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {p.subject}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {p.time} {p.teacher ? ` • ${p.teacher}` : ""}
                            </div>
                          </div>
                          <div className="flex gap-1 items-center">
                            <button
                              title="Edit"
                              onClick={() => onEditPeriod(d, i)}
                              className="p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => onDeletePeriod(d, i)}
                              className="p-1 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPeriod ? "Edit Period" : "Add Period"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <label className="block text-sm">Day</label>
              <select
                value={editorDay}
                onChange={(e) => setEditorDay(e.target.value)}
                className="mt-1 block w-full rounded border px-3 py-2"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Time</label>
              <Input
                value={editorTime}
                onChange={(e) => setEditorTime(e.target.value)}
                placeholder="09:00 - 10:00"
              />
            </div>

            <div>
              <label className="block text-sm">Subject</label>
              <Input
                value={editorSubject}
                onChange={(e) => setEditorSubject(e.target.value)}
                placeholder="Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm">Teacher</label>
              <Input
                value={editorTeacher}
                onChange={(e) => setEditorTeacher(e.target.value)}
                placeholder="Mr. John Doe"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAddOrUpdate}>
              {editingPeriod ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
