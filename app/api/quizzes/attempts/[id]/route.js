import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuizAttempt from "@/models/QuizAttempt";

/* ============================
   GET → Single Attempt Detail
============================ */
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const attempt = await QuizAttempt.findById(id)
      .populate("quiz", "title subject class questions")
      .populate("student", "name rollNumber");

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error("Attempt GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}

/* ============================
   DELETE → Re-attempt (Delete)
============================ */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const attempt = await QuizAttempt.findByIdAndDelete(id);

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Attempt deleted. Re-attempt allowed.",
    });
  } catch (error) {
    console.error("Attempt DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete attempt" },
      { status: 500 }
    );
  }
}
