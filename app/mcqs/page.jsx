import { MainLayout } from "@/components/layout/main-layout"
import { MCQsContent } from "@/components/mcqs/mcqs-content"

export const metadata = {
  title: "MCQ Question Bank | EduManage",
  description: "Manage MCQ questions for practice",
}

export default function MCQsPage() {
  return (
    <MainLayout>
      <MCQsContent />
    </MainLayout>
  )
}
