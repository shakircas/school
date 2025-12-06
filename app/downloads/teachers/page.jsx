import { MainLayout } from "@/components/layout/main-layout"
import { TeacherDownloadsContent } from "@/components/downloads/teacher-downloads-content"

export const metadata = {
  title: "Download Teacher Data | EduManage",
  description: "Export teacher data in various formats",
}

export default function TeacherDownloadsPage() {
  return (
    <MainLayout>
      <TeacherDownloadsContent />
    </MainLayout>
  )
}
