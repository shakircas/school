"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StudentForm } from "@/components/forms/student-form";
import { useToast } from "@/hooks/use-toast";
import { TeacherForm } from "@/components/forms/teacher-form";

export default function UpdateStudentPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();

  const { id } = React.use(params);

  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        if (!res.ok) throw new Error("Failed to fetch student");

        const data = await res.json();
        setStudent(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudent();
  }, [id, toast]);

  const handleSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Student Updated",
          description: "The teacher has been updated successfully.",
        });
        router.push("/teachers");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update student");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStudent) {
    return (
      <MainLayout>
        <PageHeader title="Update Student" description="Loading student..." />
        <p className="text-center py-10 text-muted-foreground">Loading...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Update Student"
        description="Modify the details of the student"
      />

      <TeacherForm
        defaultValues={student}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </MainLayout>
  );
}
