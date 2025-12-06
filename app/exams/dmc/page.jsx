import { MainLayout } from "@/components/layout/main-layout"
import { DMCContent } from "@/components/exams/dmc-content"

export const metadata = {
  title: "DMC Generation | EduManage",
  description: "Generate Detailed Mark Certificates",
}

export default function DMCPage() {
  return (
    <MainLayout>
      <DMCContent />
    </MainLayout>
  )
}
