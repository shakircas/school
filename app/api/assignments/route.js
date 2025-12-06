import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Assignment from "@/models/Assignment"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const subject = searchParams.get("subject")
    const status = searchParams.get("status")

    const query = {}

    if (classFilter) {
      query.class = classFilter
    }

    if (subject) {
      query.subject = subject
    }

    if (status) {
      query.status = status
    }

    const assignments = await Assignment.find(query).populate("assignedBy", "name").sort({ createdAt: -1 }).lean()

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    const assignment = new Assignment(data)
    await assignment.save()

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}
