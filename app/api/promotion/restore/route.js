import { NextResponse } from "next/server";
import Student from "@/models/Student";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();
    const { studentIds } = await req.json();

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          status: "Active",
          admissionStatus: "enrolled",
          withdrawalDate: null,
          withdrawalReason: null,
        },
      },
    );

    return NextResponse.json({
      message: `Restored ${result.modifiedCount} students.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
