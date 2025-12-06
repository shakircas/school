import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Teacher from "@/models/Teacher"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const department = searchParams.get("department")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 50

    const query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (department) {
      query.department = department
    }

    if (status) {
      query.status = status
    } else {
      query.status = { $ne: "Inactive" }
    }

    const teachers = await Teacher.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Teacher.countDocuments(query)

    return NextResponse.json({
      teachers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    // Check for duplicate employee ID
    const existingEmp = await Teacher.findOne({ employeeId: data.employeeId })
    if (existingEmp) {
      return NextResponse.json({ error: "Employee ID already exists" }, { status: 400 })
    }

    // Check for duplicate email
    const existingEmail = await Teacher.findOne({ email: data.email })
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const teacher = new Teacher(data)
    await teacher.save()

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error("Error creating teacher:", error)
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 })
  }
}
