import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // Adjust based on your DB helper
import Result from "@/models/Result"; // Adjust based on your Model path

export async function POST(req) {
  try {
    await connectToDatabase();
    const { examId, classId, sectionId, subject, academicYear, results } =
      await req.json();

    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    // Helper to calculate Grade
    const calculateGrade = (percentage) => {
      if (percentage >= 90) return "A+";
      if (percentage >= 80) return "A";
      if (percentage >= 70) return "B";
      if (percentage >= 60) return "C";
      if (percentage >= 50) return "D";
      return "F";
    };

    const bulkOps = results.map((item) => {
      const percentage = (item.obtainedMarks / item.totalMarks) * 100;

      const updateData = {
        examId,
        classId,
        sectionId,
        academicYear: academicYear || "2025-2026",
        student: item.studentId,
        // We push to a subjects array or update a specific subject entry
        // This logic assumes a structure where each subject result is a document
        subject: subject,
        totalMarks: item.totalMarks,
        obtainedMarks: item.obtainedMarks,
        percentage: percentage.toFixed(2),
        grade: calculateGrade(percentage),
        status: item.obtainedMarks >= item.totalMarks * 0.33 ? "Pass" : "Fail",
      };

      return {
        updateOne: {
          filter: {
            examId,
            student: item.studentId,
            subject: subject,
          },
          update: { $set: updateData },
          upsert: true, // Create if doesn't exist
        },
      };
    });

    await Result.bulkWrite(bulkOps);

    return NextResponse.json(
      { message: "Marks updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bulk Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
