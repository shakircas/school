import { MainLayout } from "@/components/layout/main-layout"
import { StudentAttendanceContent } from "@/components/attendance/student-attendance-content"

export const metadata = {
  title: "Student Attendance - EduManage Pro",
  description: "Mark and manage student attendance",
}

export default function StudentAttendancePage() {
  return (
    <MainLayout>
      <StudentAttendanceContent />
    </MainLayout>
  )
}
