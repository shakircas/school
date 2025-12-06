import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Student from "@/models/Student"
import Teacher from "@/models/Teacher"
import Fee from "@/models/Fee"
import Attendance from "@/models/Attendance"

export async function GET() {
  try {
    await connectDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalStudents, activeStudents, totalTeachers, activeTeachers, pendingFees, collectedFees, todayAttendance] =
      await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: "Active" }),
        Teacher.countDocuments(),
        Teacher.countDocuments({ status: "Active" }),
        Fee.aggregate([
          { $match: { status: { $in: ["Pending", "Partial", "Overdue"] } } },
          { $group: { _id: null, total: { $sum: "$dueAmount" } } },
        ]),
        Fee.aggregate([{ $match: { status: "Paid" } }, { $group: { _id: null, total: { $sum: "$paidAmount" } } }]),
        Attendance.findOne({
          date: { $gte: today },
          type: "Student",
        }),
      ])

    // Calculate attendance percentage
    let attendancePercentage = 0
    if (todayAttendance?.records?.length) {
      const present = todayAttendance.records.filter((r) => r.status === "Present").length
      attendancePercentage = Math.round((present / todayAttendance.records.length) * 100)
    }

    // Get class-wise student count
    const classWiseStudents = await Student.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    // Get recent activities
    const recentAdmissions = await Student.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name class section createdAt")
      .lean()

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
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
