"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  Search,
  GraduationCap,
  ClipboardList,
  BookOpen,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function AssignmentsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Rational Data Fetching
  const {
    data: assignments,
    mutate,
    isLoading,
  } = useSWR("/api/assignments", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const { data: subjectsRes } = useSWR("/api/academics/subjects", fetcher);

  const classes = classesRes?.data || []
  const subjects = subjectsRes?.data || []
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const isEdit = !!selectedAssignment;
      const url = isEdit
        ? `/api/assignments/${selectedAssignment._id}`
        : "/api/assignments";
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();
      toast.success(isEdit ? "Updated successfully" : "Assignment published");
      setIsCreateOpen(false);
      reset();
      mutate();
    } catch (error) {
      toast.error("An error occurred while saving.");
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    const date = assignment.dueDate
      ? new Date(assignment.dueDate).toISOString().split("T")[0]
      : "";
    reset({ ...assignment, dueDate: date });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment?")) return;
    await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    mutate();
  };

  const filteredData = Array.isArray(assignments)
    ? assignments.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Search & Action Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assignments..."
            className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedAssignment(null);
                reset({});
              }}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 px-5 font-semibold transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> New Task
            </Button>
          </DialogTrigger>

          {/* MEDIUM SIZE RESPONSIVE DIALOG */}
          <DialogContent className="max-w-lg md:max-w-2xl w-[95vw] rounded-[1.5rem] p-0 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-400" />
                  {selectedAssignment
                    ? "Edit Assignment"
                    : "Create New Assignment"}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Fill in the information below to notify your students.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 space-y-4 bg-white dark:bg-slate-950"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                  Title
                </Label>
                <Input
                  {...register("title", { required: true })}
                  placeholder="Assignment Name"
                  className="rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    Class
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("class", v)}
                    defaultValue={selectedAssignment?.class}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((c) => (
                        <SelectItem key={c._id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    Subject
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("subject", v)}
                    defaultValue={selectedAssignment?.subject}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                  Instructions
                </Label>
                <Textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Add task details..."
                  className="rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    Due Date
                  </Label>
                  <Input
                    type="date"
                    {...register("dueDate", { required: true })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    Marks
                  </Label>
                  <Input
                    type="number"
                    {...register("totalMarks", { required: true })}
                    placeholder="100"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <Label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    Status
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("status", v)}
                    defaultValue={selectedAssignment?.status || "Published"}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Draft", "Published", "Closed", "Graded"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-4 flex flex-row gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Save Assignment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* COMPACT ASSIGNMENT GRID */}
      {!filteredData.length ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments found"
          description="Time to add some academic tasks."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((a) => (
            <Card
              key={a._id}
              className="group border shadow-sm hover:shadow-md transition-all rounded-2xl bg-white dark:bg-slate-900"
            >
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold rounded-md bg-slate-50 dark:bg-slate-800 border-none px-2 py-0.5"
                  >
                    {a.class} • {a.subject}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(a)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500"
                      onClick={() => handleDelete(a._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {a.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-2 space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                  {a.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    {a.dueDate
                      ? format(new Date(a.dueDate), "MMM d")
                      : "No date"}
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-md">
                    {a.totalMarks} Marks
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full h-9 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {a.submissions?.length || 0} Submissions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
