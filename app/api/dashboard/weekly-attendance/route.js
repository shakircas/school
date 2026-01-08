import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      type: "Student",
      date: { $gte: startOfWeek, $lte: today },
    }).lean();

    const weekMap = {};

    attendance.forEach((day) => {
      const label = day.date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (!weekMap[label]) {
        weekMap[label] = { day: label, present: 0, absent: 0 };
      }

      day.records.forEach((r) => {
        if (r.status === "Present") weekMap[label].present++;
        if (r.status === "Absent") weekMap[label].absent++;
      });
    });

    const weeklyAttendance = Object.values(weekMap);

    return NextResponse.json(weeklyAttendance);
  } catch (error) {
    console.error("Weekly attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly attendance" },
      { status: 500 }
    );
  }
}
