import { NextResponse } from "next/server";
import Result from "@/models/Result";
// CRITICAL: You must import these to register the schemas for .populate()
import Student from "@/models/Student";
import Class from "@/models/Class";
import Exam from "@/models/Exam";
import connectDB from "@/lib/db";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // In Next.js 15+, params is a Promise
    const { id } = await params;

    // Validate ID length to prevent Mongoose CastError (24 chars for ObjectId)
    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const result = await Result.findById(id)
      .populate("student", "name rollNumber fatherName")
      .populate("classId", "name")
      .populate("exam", "name");

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    // This will show up in your Vercel Dashboard -> Logs
    console.error("VERIFICATION_ERROR:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
