"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import useSWR from "swr";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  User,
  BookOpen,
  FileUp,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url) => fetch(url).then((res) => res.json());

const AddResultDialogue = ({ open, setOpen, exams, mutate, editingData }) => {
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isEditMode = !!editingData;

  /* ---------------- API DATA ---------------- */
  const { data: studentsRes } = useSWR(
    classId ? `/api/students?classId=${classId}` : null,
    fetcher,
  );
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const students = studentsRes?.students || [];
  const dbSubjects = subjectsRes?.data || [];

  const selectedExam = useMemo(
    () => exams.find((e) => e._id === (examId || editingData?.exam?._id)),
    [examId, exams, editingData],
  );

  /* ---------------- FORM SETUP ---------------- */
  const { register, handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues: { student: "", subjects: [] },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "subjects",
  });

  const watchedSubjects = watch("subjects");

  /* ---------------- MODE LOGIC (EDIT vs ADD) ---------------- */
  useEffect(() => {
    if (open) {
      if (isEditMode) {
        // Populate Edit Data
        setExamId(editingData.exam?._id || editingData.exam);
        setClassId(editingData.classId?._id || editingData.classId);
        reset({
          student: editingData.student?._id || editingData.student,
          subjects: editingData.subjects.map((s) => ({
            subject: s.subject,
            totalMarks: s.totalMarks,
            passingMarks: s.passingMarks,
            obtainedMarks: s.obtainedMarks,
          })),
        });
      } else {
        // Reset for New Entry
        setExamId("");
        setClassId("");
        reset({ student: "", subjects: [] });
      }
    }
  }, [open, editingData, isEditMode, reset]);

  // Automatically load exam schedule for new entries
  useEffect(() => {
    if (!isEditMode && selectedExam && selectedExam.schedule?.length > 0) {
      setClassId(selectedExam.classId._id || selectedExam.classId);
      const scheduleSubjects = selectedExam.schedule.map((s) => ({
        subject: s.subject,
        totalMarks: s.totalMarks || 100,
        obtainedMarks: 0,
        passingMarks: s.passingMarks || 33,
      }));
      replace(scheduleSubjects);
    }
  }, [selectedExam, isEditMode, replace]);

  /* ---------------- HELPERS ---------------- */
  const calculateTotalStatus = () => {
    if (watchedSubjects.length === 0) return "N/A";
    return watchedSubjects.some((s) => s.obtainedMarks < s.passingMarks)
      ? "Fail"
      : "Pass";
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...editingData, // Include ID for updates
        exam: examId,
        student: data.student,
        classId: classId,
        sectionId: selectedExam?.sectionId || editingData?.sectionId || "A",
        academicYear: selectedExam?.academicYear || editingData?.academicYear,
        subjects: data.subjects,
        status: calculateTotalStatus(),
      };

      // const method = isEditMode ? "PUT" : "POST";
      const method = "POST";
      const res = await fetch("/api/results", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast.success(isEditMode ? "Result updated" : "Result saved");
      setOpen(false);
      mutate();
    } catch (err) {
      toast.error(
        isEditMode
          ? "Failed to update"
          : "Entry might already exist for this student/exam.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- BULK IMPORT ---------------- */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported = results.data.map((row) => ({
          subject: row.Subject || "",
          totalMarks: Number(row.TotalMarks) || 100,
          passingMarks: Number(row.PassingMarks) || 33,
          obtainedMarks: Number(row.ObtainedMarks) || 0,
        }));
        replace(imported);
        toast.success("CSV Imported successfully");
      },
    });
  };

  const downloadTemplate = () => {
    const headers = ["Subject", "TotalMarks", "PassingMarks", "ObtainedMarks"];
    const csvContent = [headers, ["Mathematics", "100", "33", "85"]]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result_template.csv";
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DialogTitle className="text-xl font-bold text-indigo-700 flex items-center gap-2">
              <User className="h-5 w-5" />{" "}
              {isEditMode ? "Edit Result" : "Add Exam Result"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadTemplate}
                className="text-indigo-600 hover:bg-indigo-50"
              >
                <Download className="h-4 w-4 mr-1" /> Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4 mr-1" /> Bulk CSV
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Examination
              </Label>
              <Select
                value={examId}
                onValueChange={setExamId}
                disabled={isEditMode}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.name} — {e.classId?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">
                Student
              </Label>
              <Controller
                control={control}
                name="student"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode || !students.length}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name} ({s.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="bg-slate-50/50 py-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase text-slate-600 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Subject Breakdown
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  append({
                    subject: "",
                    totalMarks: 100,
                    passingMarks: 33,
                    obtainedMarks: 0,
                  })
                }
                className="text-indigo-600"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Header for Table */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-2 text-[10px] font-bold text-slate-400 uppercase">
                <div className="col-span-4">Subject</div>
                <div className="col-span-2 text-center">Total</div>
                <div className="col-span-2 text-center">Passing</div>
                <div className="col-span-2 text-center">Obtained</div>
                <div className="col-span-2 text-right">Result</div>
              </div>

              {fields.map((f, i) => {
                const isPassing =
                  watchedSubjects[i]?.obtainedMarks >=
                  watchedSubjects[i]?.passingMarks;
                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 md:p-0 rounded-lg border md:border-none bg-slate-50/30 md:bg-transparent"
                  >
                    <div className="md:col-span-4">
                      <Label className="md:hidden text-[10px] mb-1 block">
                        Subject
                      </Label>
                      <Controller
                        control={control}
                        name={`subjects.${i}.subject`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {dbSubjects.map((sub) => (
                                <SelectItem key={sub._id} value={sub.name}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Label className="md:hidden text-[10px] mb-1 block">
                        Total
                      </Label>
                      <Input
                        type="number"
                        {...register(`subjects.${i}.totalMarks`)}
                        className="text-center h-10 bg-white"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Label className="md:hidden text-[10px] mb-1 block">
                        Passing
                      </Label>
                      <Input
                        type="number"
                        {...register(`subjects.${i}.passingMarks`)}
                        className="text-center h-10 bg-white"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Label className="md:hidden text-[10px] mb-1 block">
                        Obtained
                      </Label>
                      <Input
                        type="number"
                        {...register(`subjects.${i}.obtainedMarks`, {
                          valueAsNumber: true,
                        })}
                        className={`text-center h-10 font-bold bg-white ${isPassing ? "text-emerald-600 border-emerald-100" : "text-red-600 border-red-100"}`}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                      <Badge
                        variant="outline"
                        className={`${isPassing ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"} h-10 px-3`}
                      >
                        {isPassing ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}{" "}
                        {isPassing ? "Pass" : "Fail"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {fields.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  No subjects added. Add a row or select an exam to load
                  schedule.
                </div>
              )}
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="p-6 border-t bg-slate-50/50">
          <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">
                Overall Standing:
              </span>
              <Badge
                className={`text-sm py-1 px-4 ${calculateTotalStatus() === "Pass" ? "bg-emerald-600" : "bg-red-600"}`}
              >
                {calculateTotalStatus()}
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
                className="bg-indigo-600 hover:bg-indigo-700 px-8 min-w-[140px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isEditMode ? "Update Changes" : "Save Result"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddResultDialogue;
