import { MainLayout } from "@/components/layout/main-layout"
import { AssignmentsContent } from "@/components/assignments/assignments-content"

export const metadata = {
  title: "Assignments | EduManage",
  description: "Manage student assignments",
}

export default function AssignmentsPage() {
  return (
    <MainLayout>
      <AssignmentsContent />
    </MainLayout>
  )
}
