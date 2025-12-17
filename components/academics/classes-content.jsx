"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { saveAs } from "file-saver";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Edit, Trash2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  Bar,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#ef4444", "#a78bfa"];

export function ClassesContent() {
  // UI state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Filters & independent pagination state (separate for list & export maybe)
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-createdAt");

  const { data: analytics } = useSWR("/api/students/analytics", fetcher);
  // SWR: paginated fetch for classes
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    p.set("page", String(page));
    p.set("limit", String(limit));
    p.set("sort", sort);
    return p.toString();
  }, [search, page, limit, sort]);

  const { data, isLoading, mutate } = useSWR(
    `/api/academics/classes?${params}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: teachersRes, isLoading: teachersLoading } = useSWR(
    `/api/teachers?${params.toString()}`,
    fetcher
  );

  const teachers = teachersRes?.teachers || [];
  console.log(teachers);
  // RHF form
  const { register, control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      academicYear: "",
      sections: [{ name: "A", capacity: 40, classTeacher: "" }],
      subjects: [{ name: "", code: "", teacher: "", periods: 0 }],
      feeStructure: {
        tuitionFee: 0,
        admissionFee: 0,
        examFee: 0,
        labFee: 0,
        libraryFee: 0,
        sportsFee: 0,
        computerFee: 0,
        otherFee: 0,
      },
      schedule: [],
    },
  });

  const sectionsFieldArray = useFieldArray({ control, name: "sections" });
  const subjectsFieldArray = useFieldArray({ control, name: "subjects" });

  useEffect(() => {
    // reset if closed
    if (!isAddOpen) {
      setSelectedClass(null);
      reset();
    }
  }, [isAddOpen, reset]);

  async function onSubmit(form) {
    try {
      if (!teachers || teachers.length === 0) {
        throw new Error("No teachers available to assign.");
      }

      // Create a set of valid teacher IDs
      const validTeacherIds = new Set(teachers.map((t) => t._id));

      // Validate sections – only check if classTeacher is filled
      form.sections.forEach((s, idx) => {
        if (s.classTeacher && !validTeacherIds.has(s.classTeacher)) {
          throw new Error(
            `Invalid class teacher for section ${s.name || idx + 1}`
          );
        }
      });

      // Validate subjects – only check if teacher is filled
      form.subjects.forEach((subj, idx) => {
        if (subj.teacher && !validTeacherIds.has(subj.teacher)) {
          throw new Error(
            `Invalid teacher for subject ${subj.name || idx + 1}`
          );
        }
      });

      // Determine if adding or updating
      const method = selectedClass ? "PUT" : "POST";
      const url = "/api/academics/classes";
      const payload = selectedClass
        ? { _id: selectedClass._id, ...form }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save class");

      toast.success(selectedClass ? "Class updated" : "Class added");
      setIsAddOpen(false);
      reset();
      mutate(); // refresh SWR cache
    } catch (err) {
      toast.error(err.message || "Error saving class");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this class?")) return;
    try {
      const res = await fetch(`/api/academics/classes?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      toast.success("Deleted");
      mutate();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }

  function handleEdit(cls) {
    setSelectedClass(cls);
    // populate form
    reset({
      name: cls.name,
      academicYear: cls.academicYear,
      sections: cls.sections?.length
        ? cls.sections
        : [{ name: "A", capacity: 40, classTeacher: "" }],
      subjects: cls.subjects?.length
        ? cls.subjects
        : [{ name: "", code: "", teacher: "", periods: 0 }],
      feeStructure: cls.feeStructure || {},
      schedule: cls.schedule || [],
    });
    setIsAddOpen(true);
  }

  // PDF export
  async function exportPDF(all = false) {
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (all) p.set("limit", "1000");
      p.set("page", "1");
      const res = await fetch(
        `/api/academics/classes/export/pdf?${p.toString()}`
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      saveAs(blob, `classes_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Download started");
    } catch (err) {
      toast.error(err.message);
    }
  }

  // CSV (Excel friendly)
  async function exportCSV(all = false) {
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (all) p.set("limit", "1000");
      p.set("page", "1");
      const res = await fetch(
        `/api/academics/classes/export/csv?${p.toString()}`
      );
      if (!res.ok) throw new Error("Export failed");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `classes_${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("Download started");
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Teacher report (JSON download)
  async function exportTeacherReport() {
    try {
      const res = await fetch(`/api/academics/classes/teacher-report`);
      if (!res.ok) throw new Error("Report failed");
      const blob = await res.blob();
      saveAs(
        blob,
        `teacher_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      toast.success("Teacher report downloaded");
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Attendance Pie Chart - fetch attendance summary for selected class (quick)
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  async function loadAttendanceSummary(className) {
    try {
      if (!className) {
        setAttendanceSummary([]);
        return;
      }
      const res = await fetch(
        `/api/attendance/summary?class=${encodeURIComponent(className)}`
      );
      if (!res.ok) throw new Error("Failed to load attendance summary");
      const json = await res.json();
      setAttendanceSummary(json.data || []);
    } catch (err) {
      console.error(err);
      setAttendanceSummary([]);
    }
  }

  // when selectedClass changes load attendance
  useEffect(() => {
    if (selectedClass?.name) loadAttendanceSummary(selectedClass.name);
  }, [selectedClass]);

  // UI render
  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage classes, fee structure and schedule"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportCSV(true)}>
            <FileText className="h-4 w-4 mr-2" /> Export CSV (All)
          </Button>
          <Button variant="outline" onClick={() => exportPDF(true)}>
            <Download className="h-4 w-4 mr-2" /> Export PDF (All)
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Class
          </Button>
        </div>
      </PageHeader>

      {/* Filters + Pagination controls */}
      <Card>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search classes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue>{limit} / page</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) => {
              setSort(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue>{sort}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest</SelectItem>
              <SelectItem value="createdAt">Oldest</SelectItem>
              <SelectItem value="name">Name A→Z</SelectItem>
              <SelectItem value="-name">Name Z→A</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Classes table */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>Manage class structure and sections</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : !data?.data?.length ? (
            <EmptyState
              title="No classes"
              description="Add your first class"
              action={
                <Button onClick={() => setIsAddOpen(true)}>Add Class</Button>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.academicYear}</TableCell>
                      <TableCell>
                        {(cls.sections || []).map((s) => s.name).join(", ") ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        {(cls.subjects || []).map((s) => s.name).join(", ") ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        {(cls.sections || []).reduce(
                          (acc, s) => acc + (s.capacity || 0),
                          0
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              handleEdit(cls);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(cls._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {data.page || 1} of {data.totalPages || 1} —{" "}
                  {data.total || 0} classes
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={(data.page || 1) <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    disabled={(data.page || 1) >= (data.totalPages || 1)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance pie & teacher report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary (selected class)</CardTitle>
            <CardDescription>
              Select a class to show attendance chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Select onValueChange={(v) => loadAttendanceSummary(v)}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose class for attendance" />
                </SelectTrigger>
                <SelectContent>
                  {data?.data?.map((c) => (
                    <SelectItem key={c._id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <XAxis dataKey="_id" />
                <Tooltip />
                <Bar dataKey="total" />
                <Bar dataKey="active" />
              </BarChart>
            </ResponsiveContainer>

            {attendanceSummary?.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={attendanceSummary}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {attendanceSummary.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">
                No attendance summary loaded
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Report</CardTitle>
            <CardDescription>
              Export teacher workload & subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Generates a CSV showing each teacher, number of classes/subjects
              assigned.
            </p>
            <div className="flex gap-2">
              <Button onClick={exportTeacherReport}>
                Export Teacher Report (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-4xl w-full p-6 scrollbar">
          <DialogHeader>
            <DialogTitle>
              {selectedClass ? "Edit Class" : "Add Class"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {/* Class Name & Academic Year */}
            <div className="flex flex-col gap-2">
              <Label>Class Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Class Name is required" }}
                render={({ field }) => (
                  <Select {...field} disabled={isLoading || teachersLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Class 1", "Class 2", "Class 3"].map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Academic Year</Label>
              <Input
                {...register("academicYear", {
                  required: "Academic Year is required",
                })}
                placeholder="2025-2026"
                disabled={isLoading || teachersLoading}
              />
            </div>

            {/* Sections */}
            <div className="col-span-2">
              <Label>Sections</Label>
              <div className="flex flex-col gap-2">
                {sectionsFieldArray.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                  >
                    <Input
                      {...register(`sections.${idx}.name`, {
                        required: "Section name required",
                      })}
                      placeholder="Section (A)"
                      disabled={teachersLoading}
                    />
                    <Input
                      type="number"
                      {...register(`sections.${idx}.capacity`, {
                        required: "Capacity required",
                        valueAsNumber: true,
                        min: 1,
                      })}
                      placeholder="Capacity"
                      disabled={teachersLoading}
                    />
                    <Controller
                      control={control}
                      name={`sections.${idx}.classTeacher`}
                      rules={{ required: "Select a teacher" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={teachersLoading || !teachers.length}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((t) => (
                              <SelectItem key={t._id} value={t._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => sectionsFieldArray.remove(idx)}
                      disabled={teachersLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                className="mt-2"
                onClick={() =>
                  sectionsFieldArray.append({
                    name: "",
                    capacity: 40,
                    classTeacher: "",
                  })
                }
                disabled={teachersLoading}
              >
                Add Section
              </Button>
            </div>

            {/* Subjects */}
            <div className="col-span-2">
              <Label>Subjects</Label>
              <div className="flex flex-col gap-2">
                {subjectsFieldArray.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                  >
                    <Input
                      {...register(`subjects.${idx}.name`, {
                        required: "Subject name required",
                      })}
                      placeholder="Subject Name"
                      disabled={teachersLoading}
                    />
                    <Input
                      {...register(`subjects.${idx}.code`, {
                        required: "Code required",
                      })}
                      placeholder="Code"
                      disabled={teachersLoading}
                    />
                    <Controller
                      control={control}
                      name={`subjects.${idx}.teacher`}
                      rules={{ required: "Select a teacher" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={teachersLoading || !teachers.length}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((t) => (
                              <SelectItem key={t._id} value={t._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Input
                      type="number"
                      {...register(`subjects.${idx}.periods`, {
                        required: "Periods required",
                        valueAsNumber: true,
                        min: 1,
                      })}
                      placeholder="Periods"
                      disabled={teachersLoading}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => subjectsFieldArray.remove(idx)}
                      disabled={teachersLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                className="mt-2"
                onClick={() =>
                  subjectsFieldArray.append({
                    name: "",
                    code: "",
                    teacher: "",
                    periods: 1,
                  })
                }
                disabled={teachersLoading}
              >
                Add Subject
              </Button>
            </div>

            {/* Dialog Footer */}
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={teachersLoading || !teachers.length}
              >
                {selectedClass ? "Update Class" : "Add Class"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
