"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Eye,
  Plus,
  Printer,
  Trophy,
  Trash2,
  Edit3,
  BookOpen,
  User,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { StudentResultCard } from "./StudentResultCard";
import { ClassAnalytics } from "./ClassAnalytics";
import { ResultSubjectsDialog } from "../results/result-subjects-dialog";
import { SubjectPerformanceOverview } from "./SubjectPerformanceOverview";
import { getGradeBadge } from "@/lib/constants";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function ResultsContent() {
  const [open, setOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState(null);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("A"); // Default Section A
  const [openDmc, setOpenDmc] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- PERSISTENT STATE ---------------- */
  const [filters, setFilters] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("results-filters");
      return saved
        ? JSON.parse(saved)
        : { examId: "", classId: "", sectionId: "A", student: "" };
    }
    return { examId: "", classId: "", sectionId: "A", student: "" };
  });

  const [sortConfig, setSortConfig] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("results-sort");
      return saved
        ? JSON.parse(saved)
        : { key: "percentage", direction: "desc" };
    }
    return { key: "percentage", direction: "desc" };
  });

  useEffect(() => {
    localStorage.setItem("results-filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("results-sort", JSON.stringify(sortConfig));
  }, [sortConfig]);

  /* ---------------- API DATA ---------------- */
  const resultsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.examId) params.append("examId", filters.examId);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.sectionId) params.append("sectionId", filters.sectionId);
    if (filters.student) params.append("student", filters.student);
    return `/api/results?${params.toString()}`;
  }, [filters]);

  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: resultsRes, mutate } = useSWR(resultsUrl, fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const studentsUrl = classId
    ? `/api/students?classId=${classId}&sectionId=${sectionId}`
    : null;
  const { data: studentsRes } = useSWR(studentsUrl, fetcher);

  const exams = examsRes?.data || [];
  const results = resultsRes || [];
  const subjects = subjectsRes?.data || [];
  const classes = classesRes?.data || [];
  const students = studentsRes?.students || [];

  /* ---------------- FORM SETUP ---------------- */
  const { register, handleSubmit, control, reset, setValue, watch } = useForm({
    defaultValues: { student: "", subjects: [] },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "subjects",
  });
  const watchedSubjects = watch("subjects");

  const selectedExam = useMemo(
    () => exams.find((e) => e._id === examId),
    [examId, exams],
  );

  // Sync Class and Schedule when Exam changes
  useEffect(() => {
    if (selectedExam && !editingResultId) {
      const cid = selectedExam.classId?._id || selectedExam.classId;
      setClassId(cid);
      if (selectedExam.schedule?.length > 0) {
        const sched = selectedExam.schedule.map((s) => ({
          subject: s.subject,
          totalMarks: s.totalMarks || 100,
          obtainedMarks: 0,
          passingMarks: s.passingMarks || 33,
        }));
        replace(sched);
      }
    }
  }, [selectedExam, replace, editingResultId]);

  /* ---------------- ACTIONS ---------------- */
  const handleEdit = (result) => {
    setEditingResultId(result._id);
    setExamId(result.exam._id);
    setClassId(result.classId._id || result.classId);
    setSectionId(result.sectionId || "A");

    reset({
      student: result.student._id,
      subjects: result.subjects.map((s) => ({
        subject: s.subject,
        totalMarks: s.totalMarks,
        obtainedMarks: s.obtainedMarks,
        passingMarks: s.passingMarks || 33,
      })),
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const overallStatus = data.subjects.some(
        (s) => s.obtainedMarks < (s.passingMarks || 33),
      )
        ? "Fail"
        : "Pass";

      const payload = {
        id: editingResultId, // Included for updates
        exam: examId,
        student: data.student,
        classId,
        sectionId,
        academicYear: selectedExam?.academicYear || "2024-25",
        subjects: data.subjects,
        status: overallStatus,
      };

      const res = await fetch("/api/results", {
        method: editingResultId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast.success(editingResultId ? "Result updated" : "Result saved");
      setOpen(false);
      setEditingResultId(null);
      reset();
      mutate();
    } catch {
      toast.error("Error saving result. Check if entry already exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteResult = async (id) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      await fetch("/api/results", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      toast.success("Result deleted");
      mutate();
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ---------------- SORTING ---------------- */
  const sortedResults = useMemo(() => {
    let items = [...results].map((r) => {
      const totalMax =
        r.subjects?.reduce((acc, s) => acc + (s.totalMarks || 0), 0) || 0;
      const totalObtained =
        r.subjects?.reduce((acc, s) => acc + (s.obtainedMarks || 0), 0) || 0;
      return {
        ...r,
        calculatedPerc: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0,
        calculatedObtained: totalObtained,
        calculatedTotalMax: totalMax,
      };
    });

    if (sortConfig.key) {
      items.sort((a, b) => {
        let aVal =
          sortConfig.key === "student"
            ? a.student?.name
            : sortConfig.key === "percentage"
              ? a.calculatedPerc
              : a[sortConfig.key];
        let bVal =
          sortConfig.key === "student"
            ? b.student?.name
            : sortConfig.key === "percentage"
              ? b.calculatedPerc
              : b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [results, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-4 lg:p-4 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Academic Results
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> Central Management
            System for Student Performance
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            onClick={() => {
              setEditingResultId(null);
              reset();
              setOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Result
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="hidden md:flex"
          >
            <Printer className="h-4 w-4 mr-2" /> Print Reports
          </Button>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
      <div className="lg:col-span-3">
        <ClassAnalytics results={results} />
      </div>
      <div className="lg:col-span-1">
        <SubjectPerformanceOverview results={results} />
      </div>
      {/* </div> */}

      {/* FILTER BAR */}
      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Filter Exam
            </Label>
            <Select
              value={filters.examId}
              onValueChange={(v) => setFilters((p) => ({ ...p, examId: v }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Filter Class
            </Label>
            <Select
              value={filters.classId}
              onValueChange={(v) => setFilters((p) => ({ ...p, classId: v }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Classes" />
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
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Search Student
            </Label>
            <Input
              placeholder="Name or Roll No..."
              value={filters.student}
              onChange={(e) =>
                setFilters((p) => ({ ...p, student: e.target.value }))
              }
              className="bg-white"
            />
          </div>
          <div className="flex items-end gap-2 lg:col-span-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                setFilters({
                  examId: "",
                  classId: "",
                  sectionId: "A",
                  student: "",
                })
              }
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RESULTS TABLE */}
      <Card className="border-none shadow-lg overflow-hidden p-4">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead
                className="w-[80px] cursor-pointer"
                onClick={() => requestSort("percentage")}
              >
                Rank <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => requestSort("rollNumber")}
              >
                Roll No <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead
                className="min-w-[200px] cursor-pointer"
                onClick={() => requestSort("student")}
              >
                Student <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead className="text-center">Score %</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((r, index) => (
              <TableRow
                key={r._id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="font-bold text-slate-400">
                  #{index + 1}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {r.student?.rollNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {r.student?.name?.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-700">
                      {r.student?.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-white">
                    {r.classId?.name}
                  </Badge>
                </TableCell>
                <TableCell> {r.calculatedObtained}/ {r.calculatedTotalMax} </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`font-bold ${r.calculatedPerc >= 33 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {r.calculatedPerc.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>{getGradeBadge(r.calculatedPerc)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      r.status === "Pass"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-rose-500 hover:bg-rose-600"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-indigo-600"
                      onClick={() => {
                        setActiveResult(r);
                        setOpenDmc(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-600"
                      onClick={() => handleEdit(r)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-rose-600"
                      onClick={() => deleteResult(r._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!results.length && (
          <div className="p-20 text-center text-slate-400">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No results match your current filters.</p>
          </div>
        )}
      </Card>

      {/* ADD / EDIT DIALOG */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(false);
            setEditingResultId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-slate-50/50">
            <DialogTitle className="flex items-center gap-2 text-indigo-700">
              {editingResultId ? (
                <Edit3 className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              {editingResultId
                ? "Modify Student Result"
                : "Register New Result"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  Target Examination
                </Label>
                <Select
                  value={examId}
                  onValueChange={setExamId}
                  disabled={!!editingResultId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.name} ({e.classId?.name})
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
                  name="student"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!editingResultId || !students.length}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Student" />
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

            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50/50 py-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Marks Distribution
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      subject: "",
                      totalMarks: 100,
                      obtainedMarks: 0,
                      passingMarks: 33,
                    })
                  }
                  className="text-indigo-600 h-7"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Subject
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {fields.map((f, i) => {
                  const isPassing =
                    watchedSubjects[i]?.obtainedMarks >=
                    (watchedSubjects[i]?.passingMarks || 33);
                  return (
                    <div
                      key={f.id}
                      className="grid grid-cols-12 gap-3 items-center group animate-in slide-in-from-right-2 duration-300"
                    >
                      <div className="col-span-4">
                        <Controller
                          name={`subjects.${i}.subject`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((sub) => (
                                  <SelectItem key={sub._id} value={sub.name}>
                                    {sub.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          {...register(`subjects.${i}.totalMarks`)}
                          placeholder="Total"
                          className="text-center h-10"
                        />
                      </div>
                      <div className="col-span-2 text-center">
                        <Input
                          type="number"
                          {...register(`subjects.${i}.passingMarks`)}
                          placeholder="Pass"
                          className="text-center h-10 bg-slate-50"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          {...register(`subjects.${i}.obtainedMarks`, {
                            valueAsNumber: true,
                          })}
                          className={`text-center h-10 font-bold ${isPassing ? "text-emerald-600 border-emerald-200" : "text-rose-600 border-rose-200"}`}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(i)}
                          className="text-slate-300 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </form>

          <DialogFooter className="p-6 border-t bg-slate-50/50">
            <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">
                  Final Decision:
                </span>
                {watchedSubjects?.length > 0 && (
                  <Badge
                    className={`text-sm py-1 px-4 ${watchedSubjects.every((s) => s.obtainedMarks >= (s.passingMarks || 33)) ? "bg-emerald-600" : "bg-rose-600"}`}
                  >
                    {watchedSubjects.every(
                      (s) => s.obtainedMarks >= (s.passingMarks || 33),
                    )
                      ? "PASS"
                      : "FAIL / PROMOTED"}
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    setEditingResultId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingResultId ? (
                    "Update Result"
                  ) : (
                    "Save Result"
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResultSubjectsDialog
        open={openDmc}
        onOpenChange={setOpenDmc}
        result={activeResult}
      />
    </div>
  );
}
