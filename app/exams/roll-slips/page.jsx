import { MainLayout } from "@/components/layout/main-layout"
import { RollSlipsContent } from "@/components/exams/roll-slips-content"

export const metadata = {
  title: "Roll Number Slips | EduManage",
  description: "Generate roll number slips for examinations",
}

export default function RollSlipsPage() {
  return (
    <MainLayout>
      <RollSlipsContent />
    </MainLayout>
  )
}
