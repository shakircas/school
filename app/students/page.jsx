import { MainLayout } from "@/components/layout/main-layout"
import { StudentsContent } from "@/components/students/students-content"

export const metadata = {
  title: "Students - EduManage Pro",
  description: "Manage all students in your school",
}

export default function StudentsPage() {
  return (
    <MainLayout>
      <StudentsContent />
    </MainLayout>
  )
}
