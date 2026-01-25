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
  // const [students, attendanceDocs] = await Promise.all([
  //   Student.find({
  //     classId,
  //     sectionId,
  //     $or: [
  //       { status: "Active" },
  //       {
  //         status: "Inactive",
  //         withdrawalDate: { $gte: startDate }, // Include if they were withdrawn this month or later
  //       },
  //     ],
  //   })
  //     .select("name rollNumber status withdrawalDate withdrawalReason")
  //     .sort({ rollNumber: 1 })
  //     .lean(),
  //   Attendance.find({
  //     type: "Student",
  //     classId,
  //     sectionId,
  //     date: { $gte: startDate, $lte: endDate },
  //   })
  //     .select("date records")
  //     .lean(),
  // 1️⃣ Current Month Data Logic

  const attendedStudentIds = await Attendance.distinct("records.personId", {
    classId: new mongoose.Types.ObjectId(classId),
    sectionId,
    date: { $gte: startDate, $lte: endDate },
  });

  const [students, attendanceDocs] = await Promise.all([
    Student.find({
      classId,
      sectionId,
      $or: [
        { status: "Active" },
        {
          status: "Inactive",
          withdrawalDate: { $gte: startDate },
        },
        {
          _id: { $in: attendedStudentIds },
        },
      ],
    })
      .select("name rollNumber status withdrawalDate withdrawalReason")
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
        sessionAbsent: {
          $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] },
        },
        sessionLeave: {
          $sum: { $cond: [{ $eq: ["$records.status", "Leave"] }, 1, 0] },
        },
      },
    },
  ]);

  // Create lookup map
  // 1. Create a lookup map that stores all three values per student
  const sessionStatsMap = {};
  individualSessionStats.forEach((stat) => {
    if (stat._id) {
      sessionStatsMap[stat._id.toString()] = {
        present: stat.sessionPresent || 0,
        absent: stat.sessionAbsent || 0,
        leave: stat.sessionLeave || 0,
      };
    }
  });

  // 2. Attach stats to each student object
  const studentsWithStats = students.map((s) => {
    const studentIdStr = s._id.toString();
    const stats = sessionStatsMap[studentIdStr] || {
      present: 0,
      absent: 0,
      leave: 0,
    };

    return {
      ...s,
      // These now align perfectly with your frontend table variables
      totalPresentTillDate: stats.present,
      totalAbsentTillDate: stats.absent,
      totalLeaveTillDate: stats.leave,
    };
  });

  // 4️⃣ Calculate Total Session Stats
  const totalPresentSum = individualSessionStats.reduce(
    (acc, curr) => acc + curr.sessionPresent,
    0,
  );

  const totalAbsentSum = individualSessionStats.reduce(
    (acc, curr) => acc + curr.sessionAbsent,
    0,
  );

  const totalLeaveSum = individualSessionStats.reduce(
    (acc, curr) => acc + curr.sessionLeave,
    0,
  );

  // Total marked days in session

  // Add this near the top where you parse params
  const classObjectId = new mongoose.Types.ObjectId(classId);

  // Update your count query
  const totalSessionMarkedDaysAgg = await Attendance.aggregate([
    {
      $match: {
        type: "Student",
        classId: classObjectId,
        sectionId,
        date: { $gte: sessionStartDate, $lte: endDate },
      },
    },
    {
      $project: {
        count: { $size: "$records" },
      },
    },
    {
      $group: {
        _id: null,
        totalMarked: { $sum: "$count" },
      },
    },
  ]);

  const totalSessionMarkedDays = totalSessionMarkedDaysAgg[0]?.totalMarked || 0;

  console.log(totalSessionMarkedDays);
  return NextResponse.json({
    students: studentsWithStats,
    attendanceDocs,
    daysInMonth: endDate.getDate(),
    sessionStats: {
      totalPresent: totalPresentSum,
      totalAbsent: totalAbsentSum,
      totalLeave: totalLeaveSum,
    },
    totalMarked: totalSessionMarkedDays,
  });
}





// One Final API Optimization
// In your aggregation for totalSessionMarkedDaysAgg, you are counting the total number of records across all students. If you want the number of days school was actually open/marked, change your aggregation to this:

// JavaScript

// const totalSessionMarkedDaysAgg = await Attendance.countDocuments({
//   type: "Student",
//   classId: classObjectId,
//   sectionId,
//   date: { $gte: sessionStartDate, $lte: endDate },
// });

// const totalSessionMarkedDays = totalSessionMarkedDaysAgg;