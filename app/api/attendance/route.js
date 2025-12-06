import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Attendance from "@/models/Attendance"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const type = searchParams.get("type")
    const classFilter = searchParams.get("class")
    const section = searchParams.get("section")

    const query = {}

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      query.date = { $gte: startDate, $lte: endDate }
    }

    if (type) {
      query.type = type
    }

    if (classFilter) {
      query.class = classFilter
    }

    if (section) {
      query.section = section
    }

    const attendance = await Attendance.find(query).sort({ date: -1 }).lean()

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    // Check if attendance already exists for this date/class/section
    const existingAttendance = await Attendance.findOne({
      date: new Date(data.date),
      type: data.type,
      class: data.class,
      section: data.section,
    })

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = data.records
      existingAttendance.markedAt = new Date()
      await existingAttendance.save()
      return NextResponse.json(existingAttendance)
    }

    const attendance = new Attendance(data)
    await attendance.save()

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 })
  }
}
