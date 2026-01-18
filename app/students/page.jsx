"use client";

import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StudentsContent } from "@/components/students/students-content";

export default function StudentsPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <MainLayout>
            <div>
              {" "}
              <LoadingSpinner />{" "}
            </div>
          </MainLayout>
        }
      >
        <StudentsContent />
      </Suspense>
    </MainLayout>
  );
}
