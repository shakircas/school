import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Fee from "@/models/Fee";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      pendingFees,
      collectedFees,
      todayAttendance,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "Active" }),
      Teacher.countDocuments(),
      Teacher.countDocuments({ status: "Active" }),
      Fee.aggregate([
        { $match: { status: { $in: ["Pending", "Partial", "Overdue"] } } },
        { $group: { _id: null, total: { $sum: "$dueAmount" } } },
      ]),
      Fee.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      Attendance.findOne({
        date: { $gte: today },
        type: "Student",
      }),
    ]);

    // Calculate attendance percentage
    let attendancePercentage = 0;
    if (todayAttendance?.records?.length) {
      const present = todayAttendance.records.filter(
        (r) => r.status === "Present"
      ).length;
      attendancePercentage = Math.round(
        (present / todayAttendance.records.length) * 100
      );
    }

    // Get class-wise student count
    const classWiseStudents = await Student.aggregate([
      {
        $match: {
          status: "Active",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      {
        $unwind: "$classInfo",
      },
      {
        $group: {
          _id: "$classInfo.name",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    // Get recent activities
    const recentAdmissions = await Student.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name class section createdAt")
      .lean();

    // Recent Fee Payments
    const recentPayments = await Fee.aggregate([
      { $unwind: "$payments" },
      { $sort: { "payments.paymentDate": -1 } },
      { $limit: 3 },
      {
        $project: {
          amount: "$payments.amount",
          paymentDate: "$payments.paymentDate",
          studentName: "$studentName",
        },
      },
    ]);

    // Recent Attendance
    const recentAttendance = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("date type")
      .lean();

    const recentActivities = [
      ...recentAdmissions.map((s) => ({
        type: "admission",
        text: `New admission: ${s.name}`,
        time: s.createdAt,
      })),

      ...recentPayments.map((p) => ({
        type: "fee",
        text: `Fee collected from ${p.studentName} (Rs. ${p.amount})`,
        time: p.paymentDate,
      })),

      ...recentAttendance.map((a) => ({
        type: "attendance",
        text: `${a.type} attendance marked`,
        time: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);


    return NextResponse.json({
      students: {
        total: totalStudents,
        active: activeStudents,
      },
      teachers: {
        total: totalTeachers,
        active: activeTeachers,
      },
      fees: {
        pending: pendingFees[0]?.total || 0,
        collected: collectedFees[0]?.total || 0,
      },
      attendance: {
        percentage: attendancePercentage,
      },
      classWiseStudents,
      recentAdmissions,
      recentActivities, // 👈 THIS WAS MISSING
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
