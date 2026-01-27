import BulkMarksEntry from "@/components/exams/BulkMarksEntry";
import ManualAwardList from "@/components/exams/ManualAwardList";
import MultiSubjectImport from "@/components/exams/MultiSubjectImport";
import { MainLayout } from "@/components/layout/main-layout";
import React from "react";

const BulkSubjectsEntryPage = () => {
  return (
    <MainLayout>
      <MultiSubjectImport />
    </MainLayout>
  );
};

export default BulkSubjectsEntryPage;
