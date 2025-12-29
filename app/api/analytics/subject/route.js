import { connectDB } from "@/lib/db";
import QuizAttempt from "@/models/QuizAttempt";
import Quiz from "@/models/Quiz";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const attempts = await QuizAttempt.find().populate("quiz", "subject");

  const subjectMap = {};

  attempts.forEach((a) => {
    const subject = a.quiz.subject;
    if (!subjectMap[subject]) {
      subjectMap[subject] = { total: 0, obtained: 0, count: 0 };
    }
    subjectMap[subject].total += a.totalMarks;
    subjectMap[subject].obtained += a.obtainedMarks;
    subjectMap[subject].count += 1;
  });

  const result = Object.entries(subjectMap).map(([subject, v]) => ({
    subject,
    average: Number(((v.obtained / v.total) * 100).toFixed(2)),
    attempts: v.count,
  }));

  return NextResponse.json({ result });
}
