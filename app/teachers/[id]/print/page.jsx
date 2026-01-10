"use client";

import { use } from "react";
import useSWR from "swr";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { StudentProfile } from "@/components/students/student-profile";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";
import { TeacherProfile } from "@/components/teachers/teacher-profile";
import TeacherProfilePrint from "@/components/teachers/teacher-profile-print";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PrintTeacherPage({ params }) {
  const { id } = use(params);
  const { data: teacher, isLoading } = useSWR(`/api/teachers/${id}`, fetcher);

  if (isLoading) {
    return (
      // <MainLayout>
      <LoadingPage />
      // </MainLayout>
    );
  }

  if (!teacher || teacher.error) {
    return (
      // <MainLayout>
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Teacher not found</h2>
        <Button asChild className="mt-4">
          <Link href="/teachers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teachers
          </Link>
        </Button>
      </div>
      // </MainLayout>
    );
  }

  return (
    // <MainLayout>
    <div>
      <PageHeader>
        <Button asChild className="mt-4">
          <Link href="/teachers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teachers
          </Link>
        </Button>
      </PageHeader>
      <TeacherProfilePrint teacher={teacher} />
    </div>
    // </MainLayout>
  );
}
