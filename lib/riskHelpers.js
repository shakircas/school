import Attendance from "@/models/Attendance";

export async function getStudentAttendanceStats(
  studentId,
  classId,
  sectionId,
  academicYear,
) {
  const records = await Attendance.find({
    classId,
    sectionId,
    academicYear,
    type: "Student",
  });

  let totalDays = 0;
  let presentDays = 0;

  records.forEach((day) => {
    const studentRecord = day.records.find(
      (r) => r.personId.toString() === studentId,
    );

    if (studentRecord) {
      totalDays++;

      if (studentRecord.status === "Present") {
        presentDays++;
      }
    }
  });

  const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  return {
    totalDays,
    presentDays,
    percentage,
  };
}
