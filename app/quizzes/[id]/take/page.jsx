import { MainLayout } from "@/components/layout/main-layout"
import { TakeQuizContent } from "@/components/quizzes/take-quiz-content"

export const metadata = {
  title: "Take Quiz | EduManage",
  description: "Take a quiz",
}

export default function TakeQuizPage({ params }) {
  return (
    <MainLayout>
      <TakeQuizContent quizId={params.id} />
    </MainLayout>
  )
}
