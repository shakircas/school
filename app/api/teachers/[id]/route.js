import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Teacher from "@/models/Teacher"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const teacher = await Teacher.findById(id).lean()

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error fetching teacher:", error)
    return NextResponse.json({ error: "Failed to fetch teacher" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const data = await request.json()

    const teacher = await Teacher.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error updating teacher:", error)
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const teacher = await Teacher.findByIdAndDelete(id)

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Teacher deleted successfully" })
  } catch (error) {
    console.error("Error deleting teacher:", error)
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
  }
}
