"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  Users,
  Hash,
} from "lucide-react";

import {
  LayoutGrid,
  ClipboardList,
  UserCheck,
  BookOpenCheck,
} from "lucide-react";
import { toast } from "sonner";
import SubjectDialog from "./SubjectDialog";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function SubjectsContent() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const {
    data: subjects,
    isLoading,
    mutate,
  } = useSWR("/api/academics/subjects", fetcher);
  const { data: classesData } = useSWR("/api/academics/classes", fetcher);
  const { data: teachersData } = useSWR("/api/teachers", fetcher);

  const classes = classesData?.data || [];
  const teachers = teachersData?.teachers || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const method = selectedSubject ? "PUT" : "POST";
      const url = selectedSubject
        ? `/api/academics/subjects/${selectedSubject._id}`
        : "/api/academics/subjects";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save subject");

      toast.success(
        selectedSubject ? "Subject updated" : "Subject added successfully"
      );
      setIsAddOpen(false);
      reset();
      mutate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    reset({
      ...subject,
      classes: subject.classes?.map((c) => c._id),
      teachers: subject.teachers?.map((t) => t._id),
    });
    setIsAddOpen(true);
  };

  // Inside SubjectsContent, before the grid:
  const stats = [
    {
      label: "Total Subjects",
      value: subjects?.data?.length || 0,
      icon: LayoutGrid,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Compulsory",
      value: subjects?.data?.filter((s) => s.type === "Compulsory").length || 0,
      icon: BookOpenCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Faculty Involved",
      // Logic to count unique teacher IDs assigned to subjects
      value: new Set(
        subjects?.data?.flatMap((s) => s.teachers?.map((t) => t._id) || [])
      ).size,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Class Coverage",
      // Count unique class IDs
      value: new Set(
        subjects?.data?.flatMap((s) => s.classes?.map((c) => c._id) || [])
      ).size,
      icon: ClipboardList,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Curriculum"
          description="Design and manage the academic subjects for your institution"
        />
        <Button
          onClick={() => {
            setSelectedSubject(null);
            reset();
            setIsAddOpen(true);
          }}
          className="rounded-full shadow-lg shadow-primary/20 px-6"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Subject
        </Button>
      </div>

      {/* STATISTICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm bg-white overflow-hidden relative"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!subjects?.data?.length ? (
        <EmptyState
          icon={BookOpen}
          title="Curriculum is empty"
          description="Start by adding subjects like Mathematics, English or Science."
          action={
            <Button onClick={() => setIsAddOpen(true)}>Add Subject</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.data.map((subject) => (
            <Card
              key={subject._id}
              className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
            >
              <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleEdit(subject)}
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 capitalize mb-1">
                  {subject.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
                  <Badge
                    variant="secondary"
                    className="rounded-md px-1.5 py-0 font-bold bg-slate-100 text-slate-600"
                  >
                    {subject.code || "NO-CODE"}
                  </Badge>
                  <span>•</span>
                  <span
                    className={
                      subject.type === "Compulsory"
                        ? "text-indigo-600"
                        : "text-amber-600"
                    }
                  >
                    {subject.type}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {subject.classes?.length
                        ? subject.classes.map((c) => c.name).join(", ")
                        : "Universal"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {subject.teachers?.length
                        ? subject.teachers.map((t) => t.name).join(", ")
                        : "Unassigned"}
                    </span>
                  </div>
                  {/* NEW: Workload Insights */}
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase text-slate-400">
                      <span>Teaching Load</span>
                      <span className="text-slate-700">
                        {subject.teachers?.length || 0} Faculty
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      {/* Visual indicator of coverage */}
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (subject.classes?.length || 0) * 10,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-6">
                    <div className="flex flex-col p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">
                        Classes
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {subject.classes?.length || "All"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">
                        Type
                      </span>
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {subject.type}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubjectDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        classes={classes}
        teachers={teachers}
        selectedSubject={selectedSubject}
      />
    </div>
  );
}
