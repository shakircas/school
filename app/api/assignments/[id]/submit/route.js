import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Assignment from "@/models/Assignment";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { studentId, studentName, rollNumber, attachments } =
      await request.json();

    const submission = {
      student: studentId,
      studentName,
      rollNumber,
      attachments, // Array of { name, url }
      submittedAt: new Date(),
      status: "Submitted",
    };

    // Use $push to add to the array.
    // We use findOneAndUpdate to ensure we only add if the student hasn't submitted yet
    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, "submissions.student": { $ne: studentId } },
      { $push: { submissions: submission } },
      { new: true }
    );

    if (!assignment) {
      return NextResponse.json(
        { error: "Already submitted or assignment not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
