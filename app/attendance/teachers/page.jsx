import { MainLayout } from "@/components/layout/main-layout"
import { TeacherAttendanceContent } from "@/components/attendance/teacher-attendance-content"

export const metadata = {
  title: "Teacher Attendance | EduManage Pro",
  description: "Mark and manage daily teacher attendance",
}

export default function TeacherAttendancePage() {
  return (
    <MainLayout>
      <TeacherAttendanceContent />
    </MainLayout>
  )
}
