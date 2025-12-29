import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuizAttempt from "@/models/QuizAttempt";

export async function GET() {
  try {
    await connectDB();

    const attempts = await QuizAttempt.find();

    const totalAttempts = attempts.length;
    const totalMarks = attempts.reduce((s, a) => s + a.totalMarks, 0);
    const obtainedMarks = attempts.reduce((s, a) => s + a.obtainedMarks, 0);

    const passCount = attempts.filter((a) => a.percentage >= 40).length;
    const failCount = totalAttempts - passCount;

    const gradeStats = {};
    attempts.forEach((a) => {
      gradeStats[a.grade] = (gradeStats[a.grade] || 0) + 1;
    });

    return NextResponse.json({
      totalAttempts,
      averagePercentage: totalAttempts
        ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2))
        : 0,
      passCount,
      failCount,
      gradeStats,
    });
  } catch (error) {
    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}
