import { MainLayout } from "@/components/layout/main-layout"
import { ReportsContent } from "@/components/reports/reports-content"

export const metadata = {
  title: "Reports | EduManage",
  description: "View school analytics and reports",
}

export default function ReportsPage() {
  return (
    <MainLayout>
      <ReportsContent />
    </MainLayout>
  )
}
