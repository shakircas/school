import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FeeStructure from "@/models/FeeStructure";
import Class from "@/models/Class";
/* GET single fee structure */
export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const fee = await FeeStructure.findById(id)
    .populate("classId", "name")
    .populate("sectionId", "name");

  if (!fee) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json(fee);
}

/* UPDATE */
export async function PUT(req, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  // prevent duplicates
  const duplicate = await FeeStructure.findOne({
    _id: { $ne: id },
    classId: body.classId,
    sectionId: body.sectionId || null,
    academicYear: body.academicYear,
  });

  if (duplicate) {
    return NextResponse.json(
      { message: "Duplicate fee structure exists" },
      { status: 409 }
    );
  }

  const updated = await FeeStructure.findByIdAndUpdate(id, body, {
    new: true,
  });

  return NextResponse.json(updated);
}

/* DELETE */
export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = await params;
  await FeeStructure.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
