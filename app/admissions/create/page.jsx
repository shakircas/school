import CreateAdmissionForm from "@/components/forms/CreateAdmissionForm";
import { MainLayout } from "@/components/layout/main-layout";

export default function CreateAdmissionPage() {
  return (
    <MainLayout className="p-6">
      <CreateAdmissionForm />
    </MainLayout>
  );
}
