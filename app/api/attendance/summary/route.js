import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const classFilter = searchParams.get("class");
    const section = searchParams.get("section");
    const status = searchParams.get("status");

    const range = searchParams.get("range") || "daily";
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const query = {};

    // class filter
    if (classFilter) query.class = classFilter;

    // section filter
    if (section) query.section = section;

    // active / inactive status
    if (status) query.status = status;

    // date-range filter
    if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    // group key
    const groupKey =
      range === "monthly"
        ? { month: { $month: "$date" }, year: { $year: "$date" } }
        : {
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" },
          };

    const summary = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupKey,
          totalPresent: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
          totalAbsent: {
            $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
          },
          totalLeave: {
            $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] },
          },
          totalStudents: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("Attendance Summary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
