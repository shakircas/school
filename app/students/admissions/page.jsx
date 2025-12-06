import { MainLayout } from "@/components/layout/main-layout"
import { AdmissionsContent } from "@/components/students/admissions-content"

export const metadata = {
  title: "Admissions | EduManage",
  description: "Manage student admissions",
}

export default function AdmissionsPage() {
  return (
    <MainLayout>
      <AdmissionsContent />
    </MainLayout>
  )
}
