import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exam from "@/models/Exam"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const exam = await Exam.findById(id).lean()

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const data = await request.json()

    const exam = await Exam.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const exam = await Exam.findByIdAndDelete(id)

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exam deleted successfully" })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 })
  }
}
