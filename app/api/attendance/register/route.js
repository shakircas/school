import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");

  const uiMonth = Number(searchParams.get("month")); // 1–12
  const year = Number(searchParams.get("year"));

  if (!classId || !sectionId || !uiMonth || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const month = uiMonth - 1; // ✅ FIX

  // 1️⃣ Load students
  const students = await Student.find({
    classId,
    sectionId,
    status: "Active",
  })
    .select("name rollNumber")
    .sort({ rollNumber: 1 })
    .lean();

  // 2️⃣ Month date range (SAFE)
  const startDate = new Date(year, month, 1, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // 3️⃣ Attendance docs
  const attendanceDocs = await Attendance.find({
    type: "Student",
    classId,
    sectionId,
    date: { $gte: startDate, $lte: endDate },
  })
    .select("date records")
    .lean();

  return NextResponse.json({
    students,
    attendanceDocs,
    daysInMonth: endDate.getDate(),
  });
}
