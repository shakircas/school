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
import { Download, Eye, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { StudentResultCard } from "./StudentResultCard";
import { ClassAnalytics } from "./ClassAnalytics";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function ResultsContent() {
  const [open, setOpen] = useState(false);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [openDmc, setOpenDmc] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

  const [filters, setFilters] = useState({
    examId: "",
    classId: "",
    sectionId: "",
    student: "",
  });

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

  const getGradeBadge = (percentage) => {
    // Top tier: 80% and above
    if (percentage >= 80) return <Badge className="bg-green-600">A+</Badge>;

    // Standard tiers shifted down
    if (percentage >= 70) return <Badge className="bg-green-500">A</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-500">B</Badge>;
    if (percentage >= 50)
      return <Badge className="bg-yellow-500 text-white">C</Badge>;
    if (percentage >= 40)
      return <Badge className="bg-orange-500 text-white">D</Badge>;

    // Failing tier
    return <Badge variant="destructive">F</Badge>;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
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

      <div className="p-6 max-w-7xl mx-auto space-y-12">
        {/* Dashboard first */}
        <ClassAnalytics results={results} />

        {/* Then the printable cards */}
        {/* <div className="grid grid-cols-1 gap-8">
          {results.map((r) => (
            <StudentResultCard key={r._id} result={r} />
          ))}
        </div> */}
      </div>

      {/* Filter result */}
      <Card>
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
        </CardContent>
      </Card>

      {/* RESULTS TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Published exam results</CardDescription>
        </CardHeader>
        <CardContent>
          {!results.length ? (
            <div className="text-center py-10 text-muted-foreground">
              <Trophy className="mx-auto mb-2" />
              No results found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Obtained</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, index) => (
                  <TableRow key={r._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{r.student?.name}</TableCell>
                    <TableCell>
                      {" "}
                      <Badge> {r.classId?.name}</Badge>{" "}
                    </TableCell>
                    <TableCell>{r.exam?.name}</TableCell>
                    <TableCell>{r.totalMaxMarks}</TableCell>
                    <TableCell>{r.totalObtainedMarks}</TableCell>
                    <TableCell>{r.percentage?.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {getGradeBadge(r?.percentage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.status === "Pass"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      {getGradeBadge(Number.parseFloat(r.percentage))}
                    </TableCell> */}
                    <TableCell className="space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setActiveResult(r);
                          setOpen(true);
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
        <ResultSubjectsDialog
          open={openDmc}
          onOpenChange={setOpenDmc}
          result={activeResult}
        />
      </Card>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
        {results.map((r) => (
          <StudentResultCard key={r._id} result={r} />
        ))}
      </div> */}
    </div>
  );
}
