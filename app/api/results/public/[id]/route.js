import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Result from "@/models/Result";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    // Populate only necessary fields for public view
    const result = await Result.findById(id)
      .populate("student", "name rollNumber photo")
      .populate("classId", "name")
      .populate("exam", "name");

    if (!result)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
