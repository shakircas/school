import { MainLayout } from "@/components/layout/main-layout"
import { SubjectsContent } from "@/components/academics/subjects-content"

export const metadata = {
  title: "Subjects | EduManage",
  description: "Manage school subjects",
}

export default function SubjectsPage() {
  return (
    <MainLayout>
      <SubjectsContent />
    </MainLayout>
  )
}
