import { MainLayout } from "@/components/layout/main-layout"
import { ExamsContent } from "@/components/exams/exams-content"

export const metadata = {
  title: "Exams | EduManage",
  description: "Manage examinations and schedules",
}

export default function ExamsPage() {
  return (
    <MainLayout>
      <ExamsContent />
    </MainLayout>
  )
}
