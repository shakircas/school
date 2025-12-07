"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import CreateAdmissionForm from "@/components/forms/CreateAdmissionForm";

export default function UpdateAdmissionPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();

  const { id } = React.use(params); // ✅ correct way (not React.use)

  const [admission, setAdmission] = useState(null);
  const [loadingAdmission, setLoadingAdmission] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAdmission = async () => {
      try {
        const res = await fetch(`/api/admissions/${id}`);
        if (!res.ok) throw new Error("Failed to fetch admission");

        const data = await res.json();
        setAdmission(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoadingAdmission(false);
      }
    };

    fetchAdmission();
  }, [id, toast]);

  // ⏳ Loading screen
  if (loadingAdmission) {
    return (
      <MainLayout>
        <PageHeader
          title="Update Admission"
          description="Loading admission..."
        />
        <LoadingPage />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Update Admission"
        description="Modify admission details"
      />

      <CreateAdmissionForm admission={admission} isLoading={isLoading} />
    </MainLayout>
  );
}
