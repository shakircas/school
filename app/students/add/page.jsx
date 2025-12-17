"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StudentForm } from "@/components/forms/student-form";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useClasses } from "@/components/hooks/useClasses";
const fetcher = (url) => fetch(url).then((res) => res.json());
export default function AddStudentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // const { data: classes, isLoading: classesLoading } = useSWR(
  //   "/api/academics/classes",
  //   fetcher
  // );
  const { classes, classesLoading } = useClasses();

  console.log(classes);
  const handleSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Student added",
          description: "The student has been added successfully.",
        });
        router.push("/students");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add student");
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

  return (
    <MainLayout>
      <PageHeader
        title="Add New Student"
        description="Fill in the details to register a new student"
      />
      {classesLoading ? (
        <LoadingSpinner />
      ) : (
        <StudentForm
          onSubmit={handleSubmit}
          classes={classes}
          isLoading={isLoading}
        />
      )}
    </MainLayout>
  );
}