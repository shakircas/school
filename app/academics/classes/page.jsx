import { MainLayout } from "@/components/layout/main-layout"
import { ClassesContent } from "@/components/academics/classes-content"

export const metadata = {
  title: "Classes | EduManage",
  description: "Manage school classes",
}

export default function ClassesPage() {
  return (
    <MainLayout>
      <ClassesContent />
    </MainLayout>
  )
}
