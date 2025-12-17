"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
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
  const classes = classesData?.data || [];
  const { data: teachersData } = useSWR("/api/teachers", fetcher);
  const teachers = teachersData?.teachers || [];
  console.log(teachers);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  console.log(subjects);

  const onSubmit = async (data) => {
    try {
      const method = selectedSubject ? "PUT" : "POST";
      const url = selectedSubject
        ? `/api/academics/subjects/${selectedSubject._id}`
        : "/api/subjects";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save subject");

      toast.success(selectedSubject ? "Subject updated" : "Subject added");
      setIsAddOpen(false);
      setSelectedSubject(null);
      reset();
      mutate();
    } catch (error) {
      toast({
        title: "Validation error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subject?")) return;

    try {
      await fetch(`/api/academics/subjects/${id}`, { method: "DELETE" });
      toast.success("Subject deleted");
      mutate();
    } catch (error) {
      toast({
        title: "Validation error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);

    reset({
      ...subject,
      classes: subject.classes?.map((c) => c._id), // ✅ extract IDs
      teachers: subject.teachers?.map((t) => t._id),
    });

    setIsAddOpen(true);
  };

  console.log(subjects);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="Manage school subjects and curriculum"
      >
        <Button
          onClick={() => {
            setSelectedSubject(null);
            reset({
              name: "",
              code: "",
              type: "Compulsory",
              classes: [],
              teachers: [],
            });
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>

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
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>School curriculum subjects</CardDescription>
        </CardHeader>
        <CardContent>
          {!subjects?.data?.length ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects added"
              description="Add your first subject to get started"
              action={
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Teachers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.data.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>{subjects.data.indexOf(subject) + 1}</TableCell>
                    <TableCell className="font-medium">
                      {subject.name}
                    </TableCell>
                    <TableCell>{subject.code || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subject.type === "compulsory"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {subject.type || "compulsory"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subject.classes?.length
                        ? subject.classes.map((c) => c.name).join(", ")
                        : "All"}
                    </TableCell>
                    <TableCell>
                      {subject.teachers?.length
                        ? subject.teachers.map((t) => t.name).join(", ")
                        : "All"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(subject)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subject._id)}
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
    </div>
  );
}
