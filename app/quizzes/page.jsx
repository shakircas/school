import { MainLayout } from "@/components/layout/main-layout"
import { QuizzesContent } from "@/components/quizzes/quizzes-content"

export const metadata = {
  title: "Quizzes | EduManage",
  description: "Manage quizzes and assessments",
}

export default function QuizzesPage() {
  return (
    <MainLayout>
      <QuizzesContent />
    </MainLayout>
  )
}
