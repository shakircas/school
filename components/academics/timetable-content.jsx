"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Calendar, Clock, BookOpen, User } from "lucide-react";
import { toast } from "sonner";
import { Ta } from "zod/v4/locales";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
} from "../ui/select";

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
  const { data, isLoading, mutate } = useSWR(
    "/api/academics/timetable",
    fetcher
  );

  const { data: teachersRes } = useSWR("/api/teachers", fetcher);
  const { data: subjectsData } = useSWR("/api/academics/subjects", fetcher);

  const teachers = teachersRes?.teachers || [];
  const subjects = subjectsData?.data || [];
  console.log("teachers", teachers);
  console.log("tiemetable", data);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editDay, setEditDay] = useState("");

  const openEditor = (cls) => {
    setSelectedClass(cls);
    setIsOpen(true);
  };

  const savePeriod = async () => {
    if (!day || !time || !subjectId || !teacher)
      return toast.error("Please fill all fields");

    const cls = selectedClass;

    // If editing
    if (editMode) {
      await fetch(`/api/academics/timetable/${cls._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: editDay,
          index: editIndex,
          time,
          subjectId,
          subjectName,
          teacher,
        }),
      });

      toast.success("Period updated!");
    }
    // If adding new
    else {
      // let schedule = cls.schedule || [];
      // let targetDay = schedule.find((d) => d.day === day);

      // if (!targetDay) {
      //   targetDay = { day, periods: [] };
      //   schedule.push(targetDay);
      // }

      // targetDay.periods.push({ time, subjectId, subjectName, teacher });
      const schedule = structuredClone(cls.schedule || []);

      let targetDay = schedule.find((d) => d.day === day);
      if (!targetDay) {
        targetDay = { day, periods: [] };
        schedule.push(targetDay);
      }

      targetDay.periods.push({
        time,
        subjectId,
        subjectName,
        teacher,
      });

      await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: cls._id, schedule }),
      });

      toast.success("Period added!");
      setDay("");
      setTime("");
      setSubjectId("");
      setSubjectName("");
      setTeacher("");
    }

    setIsOpen(false);
    setEditMode(false);
    mutate();
  };

  const getDaySchedule = (cls, day) =>
    cls.schedule?.find((d) => d.day === day)?.periods || [];

  const deletePeriod = async (cls, day, index) => {
    const confirmDelete = window.confirm("Delete this period?");
    if (!confirmDelete) return;

    await fetch(`/api/academics/timetable/${cls._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, index }),
    });

    toast.success("Period deleted successfully");
    mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class & Teacher Timetable"
        description="Beautiful weekly and daily view for classes and teachers"
      />

      {/* ───── HOW TO ADD TIMETABLE (Guide) ───── */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border">
        <CardHeader>
          <CardTitle>How to Add Timetable</CardTitle>
          <CardDescription>
            Follow the steps below to create an accurate timetable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-5 space-y-2">
            <li>
              Select a class and click <b>Edit Timetable</b>
            </li>
            <li>Choose a day (Monday, Tuesday…)</li>
            <li>Enter period time (e.g., 9:00–10:00)</li>
            <li>Enter subject name (Math, English…)</li>
            <li>Enter teacher name (John Doe)</li>
            <li>
              Click <b>Add Period</b>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* ───── TAB SWITCHER ───── */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
        </TabsList>

        {/* ───── WEEKLY VIEW ───── */}
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                Shows full week schedule for each class
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!data?.data?.length ? (
                <p>No classes found</p>
              ) : (
                data.data.map((cls) => (
                  <Card
                    key={cls._id}
                    className="mb-6 border shadow-sm p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">{cls.name}</h2>
                      <Button onClick={() => openEditor(cls)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Edit Timetable
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                      {WEEKDAYS.map((d) => (
                        <Card
                          key={d}
                          className="p-3 border bg-white shadow-sm rounded-lg"
                        >
                          <h3 className="font-semibold text-blue-600 mb-2">
                            {d}
                          </h3>

                          {getDaySchedule(cls, d).length === 0 ? (
                            <p className="text-sm text-gray-400">No periods</p>
                          ) : (
                            getDaySchedule(cls, d).map((p, i) => (
                              <motion.div
                                key={p._id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-2 mb-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-sm"
                              >
                                <div className="text-xs text-gray-500">
                                  <Clock className="inline w-3 h-3 mr-1" />
                                  {p.time}
                                </div>
                                <div className="font-medium text-gray-800">
                                  <BookOpen className="inline w-3 h-3 mr-1" />
                                  {p.subjectName || p.subject}
                                </div>
                                <div className="text-xs text-gray-500">
                                  <User className="inline w-3 h-3 mr-1" />
                                  {p.teacher?.name}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedClass(cls);
                                    setDay(d);
                                    setTime(p.time);
                                    setSubjectId(p.subjectId);
                                    setSubjectName(p.subjectName);
                                    setTeacher(p.teacher?._id || p.teacher);
                                    setEditMode(true);
                                    setEditIndex(i);
                                    setEditDay(d);
                                    setIsOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>

                                {/* DELETE BUTTON */}
                                {/* <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => deletePeriod(cls, d, i)}
                                >
                                  ×
                                </Button> */}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={async () => {
                                    await fetch(
                                      `/api/academics/timetable/${cls._id}`,
                                      {
                                        method: "DELETE",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          day: d,
                                          index: i,
                                        }),
                                      }
                                    );

                                    toast.success("Period deleted");
                                    mutate();
                                  }}
                                >
                                  Delete
                                </Button>
                              </motion.div>
                            ))
                          )}
                        </Card>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── DAILY VIEW ───── */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Timetable (Class)</CardTitle>
              <CardDescription>
                Select any class to view today's schedule
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!data?.data?.length ? (
                <p>No classes found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Today's Periods</TableHead>
                      <TableHead> Teacher </TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.data.map((cls) => {
                      const today = WEEKDAYS[new Date().getDay() - 1];
                      const todayPeriods = getDaySchedule(cls, today);

                      return (
                        <TableRow key={cls._id}>
                          <TableCell>{cls.name}</TableCell>

                          <TableCell>
                            {todayPeriods.length === 0
                              ? "No periods today"
                              : todayPeriods.map((p, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded bg-blue-100 text-blue-700 mr-2"
                                  >
                                    {p.time} –{" "}
                                    {p.subjectName ||
                                      p.subject ||
                                      p.subjectId?.name}
                                  </span>
                                ))}
                          </TableCell>

                          <TableCell>
                            {todayPeriods.length === 0
                              ? "No periods today"
                              : todayPeriods.map((p, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded bg-blue-100 text-blue-700 mr-2"
                                  >
                                    {p.teacher.name}
                                  </span>
                                ))}
                          </TableCell>

                          <TableCell>
                            <Button onClick={() => openEditor(cls)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ───── EDITOR DIALOG ───── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable – {selectedClass?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Day</Label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Day</option>
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* <Label>Time</Label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="9:00 - 10:00"
            /> */}

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Time Slot
              </label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Label>Subject</Label>
            <select
              value={subjectId}
              onChange={(e) => {
                const id = e.target.value;
                const subj = subjects.find((s) => s._id === id);
                setSubjectId(id);
                setSubjectName(subj?.name || "");
              }}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Subject</option>
              {subjects?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            <Label>Teacher</Label>
            <select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Teacher</option>
              {teachers?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            {/* <Button onClick={addPeriod}>
              <Plus className="h-4 w-4 mr-2" />
              Add Period
            </Button> */}
            <Button
              onClick={savePeriod}
              disabled={!day || !time || !subjectId || !teacher}
            >
              <Plus className="h-4 w-4 mr-2" />
              {editMode ? "Save Changes" : "Add Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
