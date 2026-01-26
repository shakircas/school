import { NextResponse } from "next/server";
import Result from "@/models/Result";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();
    const { examId, classId, sectionId, subjectName, academicYear, results } =
      await req.json();

    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    const currentYear = academicYear || "2025-2026";

    // Grade logic (aligned with your 80/70/60/50/40 scale)
    const calculateGrade = (p) => {
      if (p >= 80) return "A+";
      if (p >= 70) return "A";
      if (p >= 60) return "B";
      if (p >= 50) return "C";
      if (p >= 40) return "D";
      return "F";
    };

    // Use a Promise.all to process all students in parallel for speed
    const processResults = results.map(async (item) => {
      const percentage = (item.obtainedMarks / item.totalMarks) * 100;
      const passing = Math.ceil(item.totalMarks * 0.33);

      const subjectData = {
        subject: subjectName,
        totalMarks: Number(item.totalMarks),
        obtainedMarks: Number(item.obtainedMarks),
        passingMarks: passing,
        grade: calculateGrade(percentage),
        isAbsent: item.isAbsent || false,
      };

      // 1. Find existing document or create a new instance
      let resultDoc = await Result.findOne({
        exam: examId,
        student: item.studentId,
        academicYear: currentYear,
      });

      if (!resultDoc) {
        resultDoc = new Result({
          exam: examId,
          student: item.studentId,
          classId: classId,
          sectionId: sectionId,
          academicYear: currentYear,
          subjects: [],
        });
      }

      // 2. Update the subjects array
      // Remove the subject if it already exists to prevent duplicates
      resultDoc.subjects = resultDoc.subjects.filter(
        (sub) => sub.subject !== subjectName,
      );

      // Add the new marks
      resultDoc.subjects.push(subjectData);

      // 3. Update top-level fields (in case they changed)
      resultDoc.sectionId = sectionId;
      resultDoc.classId = classId;

      // 4. IMPORTANT: .save() triggers your Schema pre-save middleware
      // which calculates percentage, totalMarks, and Pass/Fail status correctly.
      return resultDoc.save();
    });

    await Promise.all(processResults);

    return NextResponse.json(
      {
        message: "Marks synchronized and totals calculated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bulk Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
