import { auth } from "@/auth";
import QuizAttempt from "@/models/QuizAttempt";
import { connectDB } from "@/lib/db";

export async function POST(req, { params }) {
  await connectDB();
  const session = await auth();

  const data = await req.json();

  const attempt = await QuizAttempt.create({
    quiz: params.quizId,
    student: session.user.id,
    ...data,
    submittedAt: new Date(),
  });

  return Response.json({ success: true, attemptId: attempt._id });
}
