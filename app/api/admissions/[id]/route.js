import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admission from "@/models/Admission";

// GET SINGLE ADMISSION
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const admission = await Admission.findById(id).lean();

    if (!admission)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(admission);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE ADMISSION
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await req.json();

    const updated = await Admission.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE ADMISSION
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Admission.findByIdAndDelete(id);

    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
