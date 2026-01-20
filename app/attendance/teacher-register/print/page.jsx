import TeacherAttendanceRegisterView from "@/components/attendance/teacher-attendance-register-view";
import { MainLayout } from "@/components/layout/main-layout";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  const month = Number(params.month);
  const year = params.year; // keep string (see problem 2)

  return (
    <MainLayout>
      <TeacherAttendanceRegisterView month={month} year={year} />
    </MainLayout>
  );
}
