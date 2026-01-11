// import AttendanceRegisterPrint from "@/components/attendance/attendance-register-print";

// export default async function AttendanceRegisterPage({ searchParams }) {

//     const { classId, sectionId, month, year } = await searchParams;
//   return (
//     <AttendanceRegisterPrint
//       classId={classId}
//       sectionId={sectionId}
//       month={Number(month)}
//       year={Number(year)}
//     />
//   );
// }

import AttendanceRegisterView from "@/components/attendance/attendance-register-view";
import { MainLayout } from "@/components/layout/main-layout";

export default async function AttendanceRegisterPage({ searchParams }) {
  const { classId, sectionId, month, year } = await searchParams;
  return (
    <MainLayout>
      <AttendanceRegisterView
        classId={classId}
        sectionId={sectionId}
        month={Number(month)}
        year={Number(year)}
      />
    </MainLayout>
  );
}
