"use client";

import { StudentAssignmentAction } from "@/components/assignments/StudentAssignmentUpload";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation"; // To get the assignment ID from URL
import React from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const StudentAssignmentUpload = ({ params }) => {
  const { data: session, status } = useSession();

  const { id } = React.use(params);

  // Use backticks (`) for template literals and only fetch if id exists
  const { data: assignment, isLoading } = useSWR(
    id ? `/api/assignments/${id}` : null,
    fetcher
  );

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!session?.user) {
    return (
      <MainLayout>
        <h1 className="text-3xl font-bold">You are not signed in</h1>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <StudentAssignmentAction user={session.user} assignment={assignment} />
    </MainLayout>
  );
};

export default StudentAssignmentUpload;
