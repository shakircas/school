import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TopicPerformance from "@/models/TopicPerformance";
import Student from "@/models/Student";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { student, subject, chapter, topic, score, attempts } = body;

    // simple mastery formula
    const masteryLevel = Math.min(100, Math.round(score * 0.7 + attempts * 5));

    const record = await TopicPerformance.create({
      student,
      subject,
      chapter,
      topic,
      score,
      attempts,
      masteryLevel,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save topic performance" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student");

    const data = await TopicPerformance.find({
      student: studentId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
