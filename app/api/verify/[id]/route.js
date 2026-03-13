import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // Adjust based on your lib path
import Result from "@/models/Result"; // Adjust based on your model path

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

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
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
