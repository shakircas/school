import { MainLayout } from "@/components/layout/main-layout"
import { AssignmentsContent } from "@/components/assignments/assignments-content"

export const metadata = {
  title: "Assignments | EduManage",
  description: "Manage student assignments",
}

export default function AssignmentsPage() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold">Assignments</h1>
      <AssignmentsContent />
    </MainLayout>
  )
}
