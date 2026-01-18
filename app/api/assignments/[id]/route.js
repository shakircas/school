import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Assignment from "@/models/Assignment";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();

    const assignment = await Assignment.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
