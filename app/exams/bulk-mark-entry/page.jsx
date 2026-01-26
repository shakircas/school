import BulkMarksEntry from "@/components/exams/BulkMarksEntry";
import ManualAwardList from "@/components/exams/ManualAwardList";
import { MainLayout } from "@/components/layout/main-layout";
import React from "react";

const BulkMarksEntryPage = () => {
  return (
    <MainLayout>
      <BulkMarksEntry />
    </MainLayout>
  );
};

export default BulkMarksEntryPage;
