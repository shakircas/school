import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Teacher from "@/models/Teacher";
import mongoose from "mongoose";

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

    // 1️⃣ Define Date Ranges
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Session Start: April 1st logic (If current month is Jan/Feb/Mar, session started last year)
    const sessionStartYear = month >= 1 && month <= 3 ? year - 1 : year;
    const sessionStartDate = new Date(sessionStartYear, 3, 1, 0, 0, 0); // April is index 3

    // 2️⃣ Fetch All Required Data in Parallel
    const [teachers, attendanceDocs, sessionAbsenceStats] = await Promise.all([
      // A. All active teachers
      Teacher.find()
        .select("_id name designation personalNo")
        .sort({ name: 1 })
        .lean(),

      // B. Monthly attendance records for the table "dots"
      Attendance.find({
        type: "Teacher",
        date: { $gte: startDate, $lte: endDate },
      })
        .populate("markedBy", "name")
        .lean(),

      // C. Aggregation for Session-wide Absences (April to End of current month)
      Attendance.aggregate([
        {
          $match: {
            type: "Teacher",
            date: { $gte: sessionStartDate, $lte: endDate },
          },
        },
        { $unwind: "$records" },
        {
          $group: {
            _id: "$records.personId",
            totalSessionAbsents: {
              $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // 3️⃣ Map the session statistics for lookup
    const absenceMap = {};
    sessionAbsenceStats.forEach((stat) => {
      if (stat._id) {
        absenceMap[stat._id.toString()] = stat.totalSessionAbsents;
      }
    });

    // 4️⃣ Merge Session Absences into Teacher Objects
    const teachersWithStats = teachers.map((t) => ({
      ...t,
      // Carrying session-wide absence count
      sessionAbsentsTillDate: absenceMap[t._id.toString()] || 0,
    }));

    // 5️⃣ Final Clean Response
    return NextResponse.json({
      month,
      year,
      daysInMonth: endDate.getDate(),
      teachers: teachersWithStats,
      attendanceDocs: attendanceDocs || [],
    });
  } catch (error) {
    console.error("Teacher Register API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher attendance data" },
      { status: 500 }
    );
  }
}
