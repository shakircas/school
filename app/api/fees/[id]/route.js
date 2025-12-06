import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Fee from "@/models/Fee"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const fee = await Fee.findById(id).populate("student", "name rollNumber class section fatherName phone").lean()

    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(fee)
  } catch (error) {
    console.error("Error fetching fee:", error)
    return NextResponse.json({ error: "Failed to fetch fee" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const data = await request.json()

    // Recalculate amounts if needed
    if (data.totalAmount !== undefined || data.discount !== undefined || data.fine !== undefined) {
      data.netAmount = (data.totalAmount || 0) - (data.discount || 0) + (data.fine || 0)
      data.dueAmount = data.netAmount - (data.paidAmount || 0)
    }

    // Update status based on payment
    if (data.dueAmount !== undefined) {
      if (data.dueAmount <= 0) {
        data.status = "Paid"
      } else if (data.paidAmount > 0) {
        data.status = "Partial"
      }
    }

    const fee = await Fee.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(fee)
  } catch (error) {
    console.error("Error updating fee:", error)
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const { id } = await params
    const fee = await Fee.findByIdAndDelete(id)

    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Fee record deleted successfully" })
  } catch (error) {
    console.error("Error deleting fee:", error)
    return NextResponse.json({ error: "Failed to delete fee" }, { status: 500 })
  }
}
