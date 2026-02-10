import { NextResponse } from "next/server";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import Result from "@/models/Result";
import connectDB from "@/lib/db";

export async function GET() {
  await connectDB();

  try {
    // 1. Fetch only Active students
    const students = await Student.find({ status: "Active" })
      .select("name rollNumber classId sectionId")
      .limit(5)
      .lean();

    const riskData = await Promise.all(
      students.map(async (student) => {
        // 2. Fetch Attendance (Scanning nested records for this specific student)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendanceDocs = await Attendance.find({
          type: "Student",
          date: { $gte: thirtyDaysAgo },
          "records.personId": student._id,
        }).lean();

        // Calculate Attendance Rate
        const totalDays = attendanceDocs.length;
        const daysPresent = attendanceDocs.filter((doc) =>
          doc.records.find(
            (r) =>
              r.personId.toString() === student._id.toString() &&
              r.status === "Present",
          ),
        ).length;

        const attRate = totalDays > 0 ? (daysPresent / totalDays) * 100 : 100;

        // 3. Fetch Exam Results (Getting last 2 exams for trend)
        const results = await Result.find({ student: student._id })
          .sort({ createdAt: -1 })
          .limit(2)
          .lean();

        // AI RISK LOGIC
        let riskScore = 0;
        let reasons = [];

        // Logic A: Attendance Weight (40%)
        if (attRate < 80) {
          riskScore += 30;
          reasons.push(`Attendance dipped to ${attRate.toFixed(1)}%`);
        }

        // Logic B: Academic Performance (60%)
        if (results.length > 0) {
          const latest = results[0];

          // Check for specific subject failures
          const failedSubjects = latest.subjects.filter(
            (s) => s.obtainedMarks < s.passingMarks,
          );
          if (failedSubjects.length > 0) {
            riskScore += 40;
            reasons.push(`Failed in ${failedSubjects.length} subjects`);
          }

          // Check GPA/Percentage trend
          if (results.length === 2) {
            if (latest.percentage < results[1].percentage) {
              riskScore += 20;
              reasons.push("Declining grade trend");
            }
          }
        }

        const level =
          riskScore > 60 ? "High" : riskScore > 30 ? "Medium" : "Stable";

        return {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          riskScore,
          level,
          reasons:
            reasons.length > 0 ? reasons : ["Consistent attendance & grades"],
          trend: riskScore > 30 ? "down" : "up",
        };
      }),
    );

    return NextResponse.json(riskData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Risk analysis failed" },
      { status: 500 },
    );
  }
}
