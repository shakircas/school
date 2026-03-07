import Attendance from "@/models/Attendance";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import mongoose from "mongoose";

export async function buildStudentFeatures(studentId, academicYear) {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  // =============================
  // 1️⃣ ATTENDANCE %
  // =============================
  const attendanceRecords = await Attendance.find({
    academicYear,
    type: "Student",
    "records.personId": studentObjectId,
  });

  let totalDays = 0;
  let presentDays = 0;

  attendanceRecords.forEach((day) => {
    const record = day.records.find((r) => r.personId.toString() === studentId);

    if (record) {
      totalDays++;
      if (record.status === "Present") {
        presentDays++;
      }
    }
  });

  const attendancePercentage =
    totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  // =============================
  // 2️⃣ MIDTERM RESULT
  // =============================
  const midtermExam = await Exam.findOne({
    examType: "Mid Term",
    academicYear,
  });

  const midtermResult = midtermExam
    ? await Result.findOne({
        exam: midtermExam._id,
        student: studentObjectId,
      })
    : null;

  const midtermPercentage = midtermResult?.percentage || 0;

  // =============================
  // 3️⃣ UNIT TEST AVERAGE
  // =============================
  const unitExams = await Exam.find({
    examType: "Unit Test",
    academicYear,
  });

  const unitResults = await Result.find({
    exam: { $in: unitExams.map((e) => e._id) },
    student: studentObjectId,
  });

  const unitAvg =
    unitResults.length > 0
      ? unitResults.reduce((sum, r) => sum + r.percentage, 0) /
        unitResults.length
      : 0;

  // =============================
  // 4️⃣ PREVIOUS MAJOR EXAM
  // (Example: Quarterly)
  // =============================
  const previousExam = await Exam.findOne({
    // examType: "Quarterly",
    examType: "Final",
    academicYear,
  });

  const previousResult = previousExam
    ? await Result.findOne({
        exam: previousExam._id,
        student: studentObjectId,
      })
    : null;

  const previousExamPercentage = previousResult?.percentage || 0;

  return {
    attendance: Number(attendancePercentage.toFixed(2)),
    midterm: Number(midtermPercentage.toFixed(2)),
    unit_avg: Number(unitAvg.toFixed(2)),
    previous_exam: Number(previousExamPercentage.toFixed(2)),
  };
}
