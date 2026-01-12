"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { academicYears } from "@/lib/constants";

const fetcher = (url) => fetch(url).then((res) => res.json());

const STATUS_VARIANTS = {
  Scheduled: "secondary",
  Ongoing: "default",
  Completed: "outline",
  Cancelled: "destructive",
};

export function ExamsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const { data: examsRes, isLoading, mutate } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
  const { data: teacherRes } = useSWR("/api/teachers", fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];
  const subjects = subjectsRes?.data || [];
  const teachers = teacherRes?.teachers || [];

  console.log(teachers);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      examType: "",
      academicYear: "",
      classId: "",
      // sectionId: "",
      startDate: "",
      endDate: "",
      status: "Scheduled",
      schedule: [],
      instructions: "",
    },
  });

  const scheduleArray = useFieldArray({ control, name: "schedule" });

  const watchClass = watch("classId");

  const openCreate = () => {
    setSelectedExam(null);
    reset({
      name: "",
      examType: "",
      academicYear: "",
      classId: "",
      // sectionId: "",
      startDate: "",
      endDate: "",
      status: "Scheduled",
      schedule: [],
      instructions: "",
    });
    setIsCreateOpen(true);
  };

  useEffect(() => {
    const dates = watch("schedule")
      ?.map((s) => s.date)
      .filter(Boolean)
      .sort();

    if (dates.length) {
      setValue("startDate", dates[0]);
      setValue("endDate", dates[dates.length - 1]);
    }
  }, [watch("schedule")]);

  const onSubmit = async (data) => {
    try {
      const method = selectedExam ? "PUT" : "POST";
      const url = "/api/exams";
      const payload = selectedExam ? { _id: selectedExam._id, ...data } : data;

      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save exam");

      toast.success(selectedExam ? "Exam updated" : "Exam created");
      setIsCreateOpen(false);
      setSelectedExam(null);
      reset();
      mutate();
    } catch (err) {
      toast.error(err.message || "Failed to save exam");
    }
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    const prepared = {
      ...exam,
      startDate: exam.startDate
        ? new Date(exam.startDate).toISOString().slice(0, 10)
        : "",
      endDate: exam.endDate
        ? new Date(exam.endDate).toISOString().slice(0, 10)
        : "",
      schedule: (exam.schedule || []).map((s) => ({
        ...s,
        date: s.date ? new Date(s.date).toISOString().slice(0, 10) : "",
      })),
    };
    reset(prepared);
    setIsCreateOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete");
      toast.success("Exam deleted");
      mutate();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const getStatusBadge = (status) => {
    const variant = STATUS_VARIANTS[status] || "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const counts = {
    Scheduled: exams.filter((e) => e.status === "Scheduled").length,
    Ongoing: exams.filter((e) => e.status === "Ongoing").length,
    Completed: exams.filter((e) => e.status === "Completed").length,
    Total: exams.length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        description="Manage exams, schedules, and results"
      >
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedExam ? "Edit Exam" : "Create New Exam"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
              {/* Name & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exam Name</Label>
                  <Select
                    value={watch("name") || ""}
                    onValueChange={(v) => setValue("name", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select name" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Monthly",
                        "Quarterly",
                        "Mid Term",
                        "Final",
                        "Unit Test",
                        "Practice",
                      ].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.name && (
                    <p className="text-sm text-destructive">Required</p>
                  )}
                </div>

                <div>
                  <Label>Exam Type</Label>
                  <Select
                    value={watch("examType") || ""}
                    onValueChange={(v) => setValue("examType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Monthly",
                        "Quarterly",
                        "Mid Term",
                        "Final",
                        "Unit Test",
                        "Practice",
                      ].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Class, Section, Academic Year */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Class</Label>
                  <Select
                    value={watch("classId") || ""}
                    onValueChange={(v) => setValue("classId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* <div>
                  <Label>Section</Label>
                  <Select
                    value={watch("sectionId") || ""}
                    onValueChange={(v) => setValue("sectionId", v)}
                    disabled={!watchClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes
                        .find((c) => c._id === watchClass)
                        ?.sections?.map((s) => (
                          <SelectItem key={s._id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div>
                  <Label>Academic Year</Label>
                  <Select
                    value={watch("academicYear") || ""}
                    onValueChange={(v) => setValue("academicYear", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((ay) => (
                        <SelectItem key={ay} value={ay}>
                          {ay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates & Instructions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" {...register("startDate")} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" {...register("endDate")} />
                </div>
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea {...register("instructions")} rows={3} />
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Schedule</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      scheduleArray.append({
                        subject: "",
                        date: "",
                        startTime: "",
                        endTime: "",
                        venue: "",
                        totalMarks: 100,
                        passingMarks: 33,
                        invigilator: "",
                      })
                    }
                  >
                    Add Row
                  </Button>
                </div>

                {scheduleArray.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-7 gap-2 mb-2 items-end"
                  >
                    <div className="col-span-2">
                      <Label className="text-xs">Subject</Label>
                      <Select
                        value={watch(`schedule.${idx}.subject`) || ""}
                        onValueChange={(v) =>
                          setValue(`schedule.${idx}.subject`, v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s._id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        {...register(`schedule.${idx}.date`)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        {...register(`schedule.${idx}.startTime`)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        {...register(`schedule.${idx}.endTime`)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Venue</Label>
                      <Input {...register(`schedule.${idx}.venue`)} />
                    </div>

                    <div>
                      <Label className="text-xs">Marks</Label>
                      <Input
                        type="number"
                        {...register(`schedule.${idx}.totalMarks`)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <div>
                        <Label className="text-xs">Passing</Label>
                        <Input
                          type="number"
                          {...register(`schedule.${idx}.passingMarks`)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Invigilator</Label>
                        <Select
                          value={watch(`schedule.${idx}.invigilator`) || ""}
                          onValueChange={(v) =>
                            setValue(`schedule.${idx}.invigilator`, v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers?.map((t) => (
                              <SelectItem key={t._id} value={t._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => scheduleArray.remove(idx)}
                        className="h-9 self-end"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedExam ? "Update Exam" : "Create Exam"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{counts.Scheduled}</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{counts.Ongoing}</div>
            <p className="text-sm text-muted-foreground">Ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{counts.Completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{counts.Total}</div>
            <p className="text-sm text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
          <CardDescription>
            View and manage all scheduled examinations
          </CardDescription>
        </CardHeader>

        <CardContent>
          {exams.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No exams scheduled"
              description="Create your first examination to get started"
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Schedule Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">
                      {exam.name} - {exam.academicYear} ({exam.classId.name}){" "}
                    </TableCell>
                    <TableCell>{exam.examType}</TableCell>
                    <TableCell>{exam.classId.name}</TableCell>
                    <TableCell>
                      {exam.startDate
                        ? new Date(exam.startDate).toLocaleDateString()
                        : "-"}{" "}
                      —{" "}
                      {exam.endDate
                        ? new Date(exam.endDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{(exam.schedule || []).length}</TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(exam)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(exam._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ===================== DATE SHEET VIEW ===================== */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Date Sheet</CardTitle>
          <CardDescription>
            Complete examination schedule in date sheet format
          </CardDescription>
        </CardHeader>

        <CardContent>
          {exams.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Date Sheet Available"
              description="Create an exam with schedule items to generate a date sheet"
            />
          ) : (
            <div className="space-y-8">
              {exams.map((exam) => (
                <div key={exam._id} className="border rounded-lg p-4 shadow-sm">
                  {/* Exam Title */}
                  <h3 className="text-lg font-bold mb-2">
                    {exam.name} — {exam.classId.name} — ({exam.academicYear})
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    {exam.startDate
                      ? new Date(exam.startDate).toLocaleDateString()
                      : "-"}
                    {" — "}
                    {exam.endDate
                      ? new Date(exam.endDate).toLocaleDateString()
                      : "-"}
                  </p>

                  {/* Date Sheet Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Time</TableHead>
                        {/* <TableHead>Venue</TableHead> */}
                        <TableHead>Invigilator</TableHead>
                        <TableHead>Marks</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {exam.schedule?.length > 0 ? (
                        exam.schedule.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {item.date
                                ? new Date(item.date).toLocaleDateString()
                                : "-"}
                            </TableCell>

                            <TableCell className="font-medium">
                              {item.subject || "-"}
                            </TableCell>

                            <TableCell>
                              {(item.startTime || "--:--") +
                                " — " +
                                (item.endTime || "--:--")}
                            </TableCell>

                            {/* <TableCell>{item.venue || "-"}</TableCell> */}

                            <TableCell>
                              {item.invigilator?.name || "-"}
                            </TableCell>

                            <TableCell>
                              {item.totalMarks || 0} / {item.passingMarks || 0}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="6" className="text-center py-4">
                            No schedule items
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
