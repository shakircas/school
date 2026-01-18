import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Assignment from "@/models/Assignment";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id, studentId } = params;
    const body = await request.json();

    // Dynamically build the update object for the submission
    const updateData = {};
    if (body.marks) updateData["submissions.$.marks"] = Number(body.marks);
    if (body.feedback) updateData["submissions.$.feedback"] = body.feedback;
    if (body.status) updateData["submissions.$.status"] = body.status;
    updateData["submissions.$.gradedAt"] = new Date();

    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: id,
        "submissions.student": studentId,
      },
      { $set: updateData },
      { new: true }
    );

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment or Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
