// import { connectDB } from "@/lib/db";
// import Student from "@/models/Student";
// import Attendance from "@/models/Attendance";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   await connectDB();

//   const { searchParams } = new URL(req.url);

//   const classId = searchParams.get("classId");
//   const sectionId = searchParams.get("sectionId");

//   const uiMonth = Number(searchParams.get("month")); // 1–12
//   const year = Number(searchParams.get("year"));

//   if (!classId || !sectionId || !uiMonth || !year) {
//     return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
//   }

//   const month = uiMonth - 1; // ✅ FIX

//   // 1️⃣ Load students
//   const students = await Student.find({
//     classId,
//     sectionId,
//     status: "Active",
//   })
//     .select("name rollNumber")
//     .sort({ rollNumber: 1 })
//     .lean();

//   // 2️⃣ Month date range (SAFE)
//   const startDate = new Date(year, month, 1, 0, 0, 0);
//   const endDate = new Date(year, month + 1, 0, 23, 59, 59);

//   // 3️⃣ Attendance docs
//   const attendanceDocs = await Attendance.find({
//     type: "Student",
//     classId,
//     sectionId,
//     date: { $gte: startDate, $lte: endDate },
//   })
//     .select("date records")
//     .lean();

//   return NextResponse.json({
//     students,
//     attendanceDocs,
//     daysInMonth: endDate.getDate(),
//   });
// }

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");
  const uiMonth = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!classId || !sectionId || !uiMonth || !year) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const month = uiMonth - 1;
  const startDate = new Date(year, month, 1, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // 1️⃣ Current Month Data
  const [students, attendanceDocs] = await Promise.all([
    Student.find({ classId, sectionId, status: "Active" })
      .select("name rollNumber")
      .sort({ rollNumber: 1 })
      .lean(),
    Attendance.find({
      type: "Student",
      classId,
      sectionId,
      date: { $gte: startDate, $lte: endDate },
    })
      .select("date records")
      .lean(),
  ]);

  // 2️⃣ Calculate Session Range (e.g., April 1st Start)
  const sessionStartYear = month < 3 ? year - 1 : year;
  const sessionStartDate = new Date(sessionStartYear, 3, 1);

  // 3️⃣ Aggregate Individual Student Session Totals
  // CRITICAL: We convert IDs to ObjectId to ensure the $match works in aggregation
  const individualSessionStats = await Attendance.aggregate([
    {
      $match: {
        type: "Student",
        classId: new mongoose.Types.ObjectId(classId),
        sectionId: sectionId, // Keep as string if your schema stores it as string
        date: { $gte: sessionStartDate, $lte: endDate },
      },
    },
    { $unwind: "$records" },
    {
      $group: {
        _id: "$records.personId",
        sessionPresent: {
          $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] },
        },
      },
    },
  ]);

  // Create lookup map
  const sessionStatsMap = {};
  individualSessionStats.forEach((stat) => {
    if (stat._id) {
      sessionStatsMap[stat._id.toString()] = stat.sessionPresent;
    }
  });

  // Attach sessionPresent to each student object
  const studentsWithStats = students.map((s) => {
    const studentIdStr = s._id.toString();
    return {
      ...s,
      // This is what the frontend AttendanceTable is looking for
      totalPresentTillDate: sessionStatsMap[studentIdStr] || 0,
    };
  });

  const totalPresentSum = individualSessionStats.reduce(
    (acc, curr) => acc + curr.sessionPresent,
    0
  );

  return NextResponse.json({
    students: studentsWithStats,
    attendanceDocs,
    daysInMonth: endDate.getDate(),
    sessionStats: {
      totalPresent: totalPresentSum,
    },
  });
}
