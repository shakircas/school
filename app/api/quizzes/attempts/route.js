import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import QuizAttempt from "@/models/QuizAttempt";
import Quiz from "@/models/Quiz";

/* =====================================================
   POST → Save Quiz Attempt
===================================================== */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      quiz: quizId,
      student,
      studentName,
      rollNumber,
      answers,
      correct,
      total,
      score,
      timeTaken,
    } = body;

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "Quiz ID and answers are required" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const formattedAnswers = quiz.questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer == q.correctAnswer;

      return {
        questionIndex: index,
        answer: userAnswer !== undefined ? q.options[userAnswer] : null,
        isCorrect,
        marksObtained: isCorrect ? 1 : 0,
      };
    });

    const totalMarks = quiz.questions.length;
    const obtainedMarks = correct;
    const percentage = Number(score);

    let grade = "F";
    if (percentage >= 80) grade = "A+";
    else if (percentage >= 70) grade = "A";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      student: student || new mongoose.Types.ObjectId(),
      studentName,
      rollNumber,
      answers: formattedAnswers,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      status: "Completed",
      completedAt: new Date(),
      timeTaken,
    });

    return NextResponse.json({ success: true, attempt }, { status: 201 });
  } catch (error) {
    console.error("Quiz attempt POST error:", error);
    return NextResponse.json(
      { error: "Failed to save quiz attempt" },
      { status: 500 }
    );
  }
}

/* =====================================================
   GET → Fetch Quiz Attempts
===================================================== */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const quizId = searchParams.get("quiz");
    const studentId = searchParams.get("student");

    const filter = {};
    if (quizId) filter.quiz = quizId;
    if (studentId) filter.student = studentId;

    const attempts = await QuizAttempt.find(filter)
      .populate("quiz", "title subject class")
      .populate("student", "name rollNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error("Quiz attempt GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz attempts" },
      { status: 500 }
    );
  }
}
