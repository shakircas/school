import { MainLayout } from "@/components/layout/main-layout"
import { TeachersContent } from "@/components/teachers/teachers-content"

export const metadata = {
  title: "Teachers - EduManage Pro",
  description: "Manage all teachers and staff",
}

export default function TeachersPage() {
  return (
    <MainLayout>
      <TeachersContent />
    </MainLayout>
  )
}
