import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Teacher from "@/models/Teacher";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!month || !year) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 1️⃣ All teachers (for header / rows)
    const teachers = await Teacher.find()
      .select("_id name designation personalNo")
      .sort({ name: 1 })
      .lean();

    // 2️⃣ Teacher attendance ONLY from Attendance collection
    const attendanceDocs = await Attendance.find({
      type: "Teacher",
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("records.personId", "name personalNo")
      .populate("markedBy", "name")
      .lean();

    return NextResponse.json({
      month,
      year,
      daysInMonth: endDate.getDate(),
      teachers,
      attendanceDocs,
    });
  } catch (error) {
    console.error("Teacher attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher attendance" },
      { status: 500 }
    );
  }
}
