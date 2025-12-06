import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Fee from "@/models/Fee"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")
    const academicYear = searchParams.get("academicYear")
    const month = searchParams.get("month")
    const classFilter = searchParams.get("class")

    const query = {}

    if (studentId) {
      query.student = studentId
    }

    if (status) {
      query.status = status
    }

    if (academicYear) {
      query.academicYear = academicYear
    }

    if (month) {
      query.month = month
    }

    if (classFilter) {
      query.class = classFilter
    }

    const fees = await Fee.find(query)
      .populate("student", "name rollNumber class section")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(fees)
  } catch (error) {
    console.error("Error fetching fees:", error)
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const data = await request.json()

    // Generate invoice number
    const count = await Fee.countDocuments()
    data.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`

    // Calculate net amount
    data.netAmount = data.totalAmount - (data.discount || 0) + (data.fine || 0)
    data.dueAmount = data.netAmount - (data.paidAmount || 0)

    const fee = new Fee(data)
    await fee.save()

    return NextResponse.json(fee, { status: 201 })
  } catch (error) {
    console.error("Error creating fee:", error)
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 })
  }
}
