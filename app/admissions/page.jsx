import AdmissionContent from "@/components/admissions/AdmissionContent";
import { MainLayout } from "@/components/layout/main-layout";

export default function AdmissionsPage() {
  return (
    <MainLayout className="p-6">
      <AdmissionContent />
    </MainLayout>
  );
}
