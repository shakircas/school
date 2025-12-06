import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Result from "@/models/Result"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const studentId = searchParams.get("studentId")
    const classFilter = searchParams.get("class")
    const academicYear = searchParams.get("academicYear")

    const query = {}

    if (examId) {
      query.exam = examId
    }

    if (studentId) {
      query.student = studentId
    }

    if (classFilter) {
      query.class = classFilter
    }

    if (academicYear) {
      query.academicYear = academicYear
    }

    const results = await Result.find(query)
      .populate("exam", "name examType")
      .populate("student", "name rollNumber")
      .sort({ rank: 1 })
      .lean()

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    // Calculate totals and grade
    let totalMarks = 0
    let obtainedMarks = 0

    data.subjects.forEach((subject) => {
      totalMarks += subject.totalMarks
      obtainedMarks += subject.obtainedMarks
      subject.percentage = (subject.obtainedMarks / subject.totalMarks) * 100
      subject.grade = calculateGrade(subject.percentage)
    })

    data.totalMarks = totalMarks
    data.obtainedMarks = obtainedMarks
    data.percentage = (obtainedMarks / totalMarks) * 100
    data.grade = calculateGrade(data.percentage)
    data.status = data.percentage >= 33 ? "Pass" : "Fail"

    const result = new Result(data)
    await result.save()

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating result:", error)
    return NextResponse.json({ error: "Failed to create result" }, { status: 500 })
  }
}

function calculateGrade(percentage) {
  if (percentage >= 90) return "A+"
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  if (percentage >= 33) return "E"
  return "F"
}
