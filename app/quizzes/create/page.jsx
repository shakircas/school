import { MainLayout } from "@/components/layout/main-layout"
import { CreateQuizContent } from "@/components/quizzes/create-quiz-content"

export const metadata = {
  title: "Create Quiz | EduManage",
  description: "Create a new quiz",
}

export default function CreateQuizPage() {
  return (
    <MainLayout>
      <CreateQuizContent />
    </MainLayout>
  )
}
