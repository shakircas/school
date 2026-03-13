// app/api/verify/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Result from "@/models/Result";
// Add these even if you don't use them directly in the code!
import Student from "@/models/Student";
import Class from "@/models/Class";
import Exam from "@/models/Exam";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Optional: Validate if ID is a valid MongoDB ObjectId to prevent crash
    if (id.length !== 24) {
      return NextResponse.json({ error: "Malformed ID" }, { status: 400 });
    }

    const result = await Result.findById(id)
      .populate("student", "name rollNumber fatherName")
      .populate("classId", "name")
      .populate("examId", "name");

    if (!result) {
      return NextResponse.json(
        { error: "Invalid Certificate ID" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Verification Error:", error); // Check your Vercel logs for this!
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
