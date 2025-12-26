import { MainLayout } from "@/components/layout/main-layout";
import { AIMCQsContent } from "@/components/ai/ai-mcqs-content";

export const metadata = {
  title: "AI Paper Generator | EduManage",
  description: "Generate exam papers using AI",
};

export default function AIMCQsPage() {
  return (
    <MainLayout>
      <AIMCQsContent />
    </MainLayout>
  );
}
