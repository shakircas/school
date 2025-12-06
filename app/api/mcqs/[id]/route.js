import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import MCQ from "@/models/MCQ"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const mcq = await MCQ.findById(params.id)

    if (!mcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: mcq })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const data = await request.json()

    const mcq = await MCQ.findByIdAndUpdate(params.id, data, { new: true })

    if (!mcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: mcq })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const mcq = await MCQ.findByIdAndDelete(params.id)

    if (!mcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "MCQ deleted" })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
