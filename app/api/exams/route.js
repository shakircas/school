import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const academicYear = searchParams.get("academicYear")
    const status = searchParams.get("status")
    const examType = searchParams.get("examType")

    const query = {}

    if (classFilter) {
      query.class = classFilter
    }

    if (academicYear) {
      query.academicYear = academicYear
    }

    if (status) {
      query.status = status
    }

    if (examType) {
      query.examType = examType
    }

    const exams = await Exam.find(query).sort({ startDate: -1 }).lean()

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    const exam = new Exam(data)
    await exam.save()

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
