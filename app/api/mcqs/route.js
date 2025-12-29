import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MCQ from "@/models/MCQ";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get("class");
    const subject = searchParams.get("subject");
    const chapter = searchParams.get("chapter");
    const difficulty = searchParams.get("difficulty");
    const limit = Number.parseInt(searchParams.get("limit")) || 50;

    const query = {};

    if (classFilter) {
      query.class = classFilter;
    }

    if (subject) {
      query.subject = subject;
    }

    if (chapter) {
      query.chapter = chapter;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const mcqs = await MCQ.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(mcqs);
  } catch (error) {
    console.error("Error fetching MCQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch MCQs" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // 🛡️ Normalize options
    if (!Array.isArray(data.options)) {
      throw new Error("Options must be an array of 4 strings");
    }

    if (data.options.length !== 4) {
      throw new Error("MCQ must have exactly 4 options");
    }

    data.correctAnswer = Number(data.correctAnswer);
    if (
      Number.isNaN(data.correctAnswer) ||
      data.correctAnswer < 0 ||
      data.correctAnswer > 3
    ) {
      throw new Error("Invalid correctAnswer index");
    }

    const mcq = new MCQ(data);
    await mcq.save();

    return NextResponse.json(mcq, { status: 201 });
  } catch (error) {
    console.error("Error creating MCQ:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create MCQ" },
      { status: 400 }
    );
  }
}
