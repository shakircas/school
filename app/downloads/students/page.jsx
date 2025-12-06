import { MainLayout } from "@/components/layout/main-layout"
import { StudentDownloadsContent } from "@/components/downloads/student-downloads-content"

export const metadata = {
  title: "Download Student Data | EduManage",
  description: "Export student data in various formats",
}

export default function StudentDownloadsPage() {
  return (
    <MainLayout>
      <StudentDownloadsContent />
    </MainLayout>
  )
}
