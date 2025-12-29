import { connectDB } from "@/lib/db";
import QuizAttempt from "@/models/QuizAttempt";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const attempts = await QuizAttempt.find();

  const questionStats = {};

  attempts.forEach((attempt) => {
    attempt.answers.forEach((ans) => {
      const q = ans.questionIndex;
      if (!questionStats[q]) {
        questionStats[q] = { correct: 0, total: 0 };
      }
      questionStats[q].total += 1;
      if (ans.isCorrect) questionStats[q].correct += 1;
    });
  });

  const difficulty = Object.entries(questionStats).map(([q, v]) => ({
    questionIndex: q,
    successRate: Number(((v.correct / v.total) * 100).toFixed(2)),
    level:
      v.correct / v.total > 0.7
        ? "Easy"
        : v.correct / v.total > 0.4
        ? "Medium"
        : "Hard",
  }));

  return NextResponse.json({ difficulty });
}
