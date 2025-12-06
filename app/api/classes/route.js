import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Class from "@/models/Class"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const academicYear = searchParams.get("academicYear")
    const status = searchParams.get("status")

    const query = {}

    if (academicYear) {
      query.academicYear = academicYear
    }

    if (status) {
      query.status = status
    }

    const classes = await Class.find(query).populate("sections.classTeacher", "name").sort({ name: 1 }).lean()

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    const classDoc = new Class(data)
    await classDoc.save()

    return NextResponse.json(classDoc, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}
