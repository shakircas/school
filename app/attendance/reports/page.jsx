import { MainLayout } from "@/components/layout/main-layout"
import { AttendanceReportsContent } from "@/components/attendance/attendance-reports-content"

export const metadata = {
  title: "Attendance Reports | EduManage Pro",
}

export default function AttendanceReportsPage() {
  return (
    <MainLayout>
      <AttendanceReportsContent />
    </MainLayout>
  )
}
