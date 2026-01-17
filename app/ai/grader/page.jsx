import { MainLayout } from "@/components/layout/main-layout";
import { AIMCQsContent } from "@/components/ai/ai-mcqs-content";
import { AIAutoGrader } from "@/components/ai/AIAutoGrader";

export const metadata = {
  title: "AI Paper Generator | EduManage",
  description: "Generate exam papers using AI",
};

export default function AIAutoGraderPage() {
  return (
    <MainLayout>
      <AIAutoGrader />
    </MainLayout>
  );
}
