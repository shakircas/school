"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Download, Eye, Plus, Printer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { StudentResultCard } from "./StudentResultCard";
import { ClassAnalytics } from "./ClassAnalytics";
import { ResultSubjectsDialog } from "../results/result-subjects-dialog";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { SubjectPerformanceOverview } from "./SubjectPerformanceOverview";
import { getGradeBadge } from "@/lib/constants";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function ResultsContent() {
  const [open, setOpen] = useState(false);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [openDmc, setOpenDmc] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

  // const [filters, setFilters] = useState({
  //   examId: "",
  //   classId: "",
  //   sectionId: "",
  //   student: "",
  // });

  // 1. PERSISTENT FILTERS INITIALIZATION
  const [filters, setFilters] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("results-filters");
      return saved
        ? JSON.parse(saved)
        : { examId: "", classId: "", sectionId: "", student: "" };
    }
    return { examId: "", classId: "", sectionId: "", student: "" };
  });

  // 2. PERSISTENT SORTING INITIALIZATION
  const [sortConfig, setSortConfig] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("results-sort");
      return saved
        ? JSON.parse(saved)
        : { key: "percentage", direction: "desc" };
    }
    return { key: "percentage", direction: "desc" };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("results-filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("results-sort", JSON.stringify(sortConfig));
  }, [sortConfig]);

  const resultsUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.examId) params.append("examId", filters.examId);
    if (filters.classId) params.append("classId", filters.classId);
    if (filters.sectionId) params.append("sectionId", filters.sectionId);
    if (filters.student) params.append("student", filters.student);

    return `/api/results?${params.toString()}`;
  }, [filters]);

  // const { data: results = [], mutate } = useSWR(resultsUrl, fetcher);

  /* ---------------- API ---------------- */
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: resultsRes, mutate } = useSWR(resultsUrl, fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const studentsUrl =
    classId && sectionId
      ? `/api/students?classId=${classId}&sectionId=${sectionId}`
      : null;

  const { data: studentsRes } = useSWR(studentsUrl, fetcher);

  const exams = examsRes?.data || [];
  const results = resultsRes || [];
  const subjects = subjectsRes?.data || [];
  const classes = classesRes?.data || [];
  const students = studentsRes?.students || [];

  /* ---------------- EXAM ---------------- */
  const exam = useMemo(
    () => exams.find((e) => e._id === examId),
    [examId, exams],
  );

  console.log(results);

  /* Sync class & section from exam */
  useEffect(() => {
    if (exam) {
      setClassId(exam.classId);
      setSectionId(exam.sectionId);
    } else {
      setClassId("");
      setSectionId("");
    }
  }, [exam]);

  /* ---------------- FORM ---------------- */
  const { register, handleSubmit, control, reset, setValue } = useForm({
    defaultValues: {
      student: "",
      subjects: [{ subject: "", totalMarks: 100, obtainedMarks: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subjects",
  });

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (form) => {
    try {
      if (!exam) return toast.error("Please select exam");

      const payload = {
        exam: examId,
        student: form.student,
        classId: exam.classId,
        sectionId: exam.sectionId,
        academicYear: exam.academicYear,
        subjects: form.subjects,
      };

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success("Result saved successfully");
      reset();
      setOpen(false);
      mutate();
    } catch {
      toast.error("Failed to save result");
    }
  };

  const exportResults = async () => {
    try {
      const response = await fetch(
        `/api/results?export=csv&class=${selectedClass}&exam=${selectedExam}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "results.csv";
      a.click();
      toast.success("Results exported successfully");
    } catch (error) {
      toast.error("Failed to export results");
    }
  };

  
  /* ---------------- SORTING & RANKING LOGIC ---------------- */
  const sortedResults = useMemo(() => {
    let items = [...results].map((r) => {
      // Pre-calculate totals for accurate sorting
      const totalMax =
        r.subjects?.reduce((acc, s) => acc + (s.totalMarks || 0), 0) || 0;
      const totalObtained =
        r.subjects?.reduce((acc, s) => acc + (s.obtainedMarks || 0), 0) || 0;
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      return {
        ...r,
        calculatedPerc: percentage,
        calculatedObtained: totalObtained,
      };
    });

    if (sortConfig.key) {
      items.sort((a, b) => {
        let aVal, bVal;
        if (sortConfig.key === "student") {
          aVal = a.student?.name;
          bVal = b.student?.name;
        } else if (sortConfig.key === "percentage") {
          aVal = a.calculatedPerc;
          bVal = b.calculatedPerc;
        } else if (sortConfig.key === "obtained") {
          aVal = a.calculatedObtained;
          bVal = b.calculatedObtained;
        } else if (sortConfig.key === "rollNumber") {
          aVal = Number(a.student?.rollNumber) || 0;
          bVal = Number(b.student?.rollNumber) || 0;
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [results, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column)
      return <ArrowUpDown className="ml-2 h-3 w-3" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="bg-rose ml-2 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-2 h-3 w-3" />
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 print:block print:space-y-0 print:max-w-none">
      {/* HEADER */}
      <div className="print:hidden flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Exam Results</h2>
          <p className="text-muted-foreground">
            Exam → Class → Section → Student → Subjects
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Result
        </Button>
        <Button variant="outline" onClick={exportResults}>
          <Download className="h-4 w-4 mr-2" />
          Export{" "}
        </Button>
      </div>

      {/* ADD RESULT */}
      <div className="print:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Exam Result</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* EXAM */}
              <div>
                <Label>Exam</Label>
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.name} — {e.examType} ({e.academicYear}-
                        {e.classId?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CLASS */}
              <div>
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))} */}
                    {exams.map((e) => (
                      <SelectItem key={e._id} value={e.classId}>
                        {e.classId.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SECTION */}
              <div>
                <Label>Section</Label>
                <Select
                  value={sectionId}
                  onValueChange={setSectionId}
                  disabled={!classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes
                      .find((c) => c._id === classId)
                      ?.sections?.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* STUDENT */}
              <div>
                <Label>Student</Label>
                <Select
                  disabled={!students.length}
                  onValueChange={(v) => setValue("student", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} ({s.rollNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SUBJECTS */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Marks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fields.map((f, i) => (
                    <div key={f._id} className="grid grid-cols-4 gap-2">
                      {/* SUBJECT DROPDOWN */}
                      <Select
                        value={f.subject}
                        onValueChange={(v) =>
                          setValue(`subjects.${i}.subject`, v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((sub) => (
                            <SelectItem key={sub._id} value={sub.name}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Total"
                        {...register(`subjects.${i}.totalMarks`, {
                          required: true,
                        })}
                      />

                      <Input
                        type="number"
                        placeholder="Obtained"
                        {...register(`subjects.${i}.obtainedMarks`, {
                          required: true,
                        })}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(i)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        subject: "",
                        totalMarks: 100,
                        obtainedMarks: 0,
                      })
                    }
                  >
                    + Add Subject
                  </Button>
                </CardContent>
              </Card>

              <DialogFooter>
                <Button type="submit">Save Result</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="print:hidden grid grid-cols-1 gap-6 max-w-7xl mx-auto space-y-12">
        {/* Dashboard first */}
        <ClassAnalytics results={results} />

        {/* Then the printable cards */}
        {/* <div className="grid grid-cols-1 gap-8">
          {results.map((r) => (
            <StudentResultCard key={r._id} result={r} />
          ))}
        </div> */}
        <section>
          <h3 className="text-xl font-bold mb-4">
            Subject-Wise Mastery (Principal's View)
          </h3>
          <SubjectPerformanceOverview results={results} />
        </section>
      </div>

      {/* Filter result */}
      <Card className="print-hidden">
        <CardContent className="grid md:grid-cols-5 gap-3">
          <Select
            value={filters.examId}
            onValueChange={(v) => setFilters((p) => ({ ...p, examId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name} ({e.examType} - {e.academicYear} - {e.classId?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.classId}
            onValueChange={(v) => setFilters((p) => ({ ...p, classId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search student / roll"
            value={filters.student}
            onChange={(e) =>
              setFilters((p) => ({ ...p, student: e.target.value }))
            }
          />

          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                examId: "",
                classId: "",
                sectionId: "",
                student: "",
              })
            }
          >
            Reset
          </Button>
          <Button
            onClick={() => window.print()}
            disabled={!results.length}
            className="bg-indigo-600 text-white"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </CardContent>
      </Card>

      {/* RESULTS TABLE */}

      {/* Change print:block to simply ensuring it's not hidden if a parent is hidden */}
      <Card className="print:block print:static print:visible print:w-full print:border-none print:shadow-none">
        <CardHeader className="print:pb-2">
          <CardTitle className="print:text-xl">Exam Results Report</CardTitle>
          <CardDescription className="print:hidden">
            Published exam results
          </CardDescription>

          {/* Add a Print-Only Header for Context */}
          <div className="hidden print:block text-sm font-semibold mt-2">
            Exam:{" "}
            {exams.find((e) => e._id === filters.examId)?.name || "All Exams"} |
            Class:{" "}
            {classes.find((c) => c._id === filters.classId)?.name ||
              "All Classes"}
          </div>
        </CardHeader>
        <CardContent className="print:p-0">
          {!results.length ? (
            <div className="text-center py-10 text-muted-foreground">
              <Trophy className="mx-auto mb-2" />
              No results found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("percentage")}
                  >
                    Rank <SortIcon column="percentage" />
                  </TableHead>

                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("rollNumber")}
                  >
                    Roll No. <SortIcon column="rollNumber" />
                  </TableHead>

                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("student")}
                  >
                    Student <SortIcon column="student" />
                  </TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                  <TableHead
                    className="cursor-pointer text-center"
                    onClick={() => requestSort("obtained")}
                  >
                    Obtained <SortIcon column="obtained" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-center"
                    onClick={() => requestSort("percentage")}
                  >
                    Score % <SortIcon column="percentage" />
                  </TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((r, index) => (
                  <TableRow key={r._id}>
                    {/* Local Rank calculation based on sorting */}
                    <TableCell className="font-bold">
                      {sortConfig.key === "percentage" &&
                      sortConfig.direction === "desc"
                        ? `#${index + 1}`
                        : "-"}
                    </TableCell>
                    <TableCell>{r.student?.rollNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.student?.name}</div>
                      {/* <div className="text-xs text-muted-foreground">
                        {r.student?.rollNumber}
                      </div> */}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Badge> {r.classId?.name}</Badge>{" "}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.exam?.name}</TableCell>
                    <TableCell className="text-center">
                      {r.subjects?.length}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {r.calculatedObtained} /{" "}
                      {r.subjects?.reduce(
                        (acc, s) => acc + (s.totalMarks || 0),
                        0,
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {r.calculatedPerc.toFixed(1)}%
                    </TableCell>
                    <TableCell>{getGradeBadge(r.calculatedPerc)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.status === "Pass" ? "bg-green-600" : "bg-red-600"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setActiveResult(r);
                          setOpenDmc(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setOpen(true);
                          setExamId(r.exam._id);
                          setValue("student", r.student._id);
                          reset({ subjects: r.subjects });
                        }}
                      >
                        ✏️
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={async () => {
                          if (!confirm("Delete this result?")) return;
                          await fetch("/api/results", {
                            method: "DELETE",
                            body: JSON.stringify({ id: r._id }),
                          });
                          toast.success("Result deleted");
                          mutate();
                        }}
                      >
                        🗑️
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ResultSubjectsDialog
        open={openDmc}
        onOpenChange={setOpenDmc}
        result={activeResult}
      />
    </div>
  );
}
