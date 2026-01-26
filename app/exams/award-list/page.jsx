import ManualAwardList from "@/components/exams/ManualAwardList";
import { MainLayout } from "@/components/layout/main-layout";
import React from "react";

const AwardListPage = () => {
  return (
    <MainLayout>
      <ManualAwardList />
    </MainLayout>
  );
};

export default AwardListPage;
