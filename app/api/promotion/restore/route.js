import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/Student";

export async function POST(req) {
  try {
    await dbConnect();
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
