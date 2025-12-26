import { MainLayout } from "@/components/layout/main-layout";
import { TakeQuizContent } from "@/components/quizzes/take-quiz-content";

export const metadata = {
  title: "Take Quiz | EduManage",
  description: "Take a quiz",
};

export default async function TakeQuizPage({ params }) {
  const { id } = await params;
  return (
    <MainLayout>
      <TakeQuizContent quizId={id} />
    </MainLayout>
  );
}
