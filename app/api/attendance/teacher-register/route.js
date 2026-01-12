import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Teacher from "@/models/Teacher";
import TeacherAttendance from "@/models/TeacherAttendance";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json(
      { error: "Month and year required" },
      { status: 400 }
    );
  }

  const teachers = await Teacher.find().sort({ name: 1 });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendanceDocs = await TeacherAttendance.find({
    date: { $gte: startDate, $lte: endDate },
  });

  return NextResponse.json({
    teachers,
    attendanceDocs,
    daysInMonth: endDate.getDate(),
  });
}
