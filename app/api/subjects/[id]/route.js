import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Subject from "@/models/Subject"

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const data = await request.json()
    const subject = await Subject.findByIdAndUpdate(params.id, data, { new: true })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: subject })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    await Subject.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: "Subject deleted" })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
