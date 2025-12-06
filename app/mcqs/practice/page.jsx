import { MainLayout } from "@/components/layout/main-layout"
import { MCQPracticeContent } from "@/components/mcqs/mcq-practice-content"

export const metadata = {
  title: "MCQ Practice | EduManage",
  description: "Practice MCQ questions",
}

export default function MCQPracticePage() {
  return (
    <MainLayout>
      <MCQPracticeContent />
    </MainLayout>
  )
}
