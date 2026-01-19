import TeacherAttendanceRegisterView from "@/components/attendance/teacher-attendance-register-view";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  const month = Number(params.month);
  const year = params.year; // keep string (see problem 2)

  return <TeacherAttendanceRegisterView month={month} year={year} />;
}
