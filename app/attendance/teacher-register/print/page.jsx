import TeacherAttendanceRegisterView from "@/components/attendance/teacher-attendance-register-view";

export default function Page({ searchParams }) {
  return (
    <TeacherAttendanceRegisterView
      month={Number(searchParams.month)}
      year={Number(searchParams.year)}
    />
  );
}
