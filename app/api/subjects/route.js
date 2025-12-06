import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subject from "@/models/Subject"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const classFilter = searchParams.get("class")

    const query = {}

    if (status) {
      query.status = status
    }

    if (classFilter) {
      query.classes = classFilter
    }

    const subjects = await Subject.find(query).populate("teachers", "name").sort({ name: 1 }).lean()

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    const subject = new Subject(data)
    await subject.save()

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
  }
}
