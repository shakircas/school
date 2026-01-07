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
  const oldStructure = await FeeStructure.findById(id);

  if (!oldStructure) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 🔒 BLOCK EDIT
  if (oldStructure.isLocked) {
    return NextResponse.json(
      { message: "This fee structure is locked. Create a new version." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { fees, effectiveFromMonth, remarks } = body;

  if (!effectiveFromMonth) {
    return NextResponse.json(
      { message: "effectiveFromMonth is required" },
      { status: 400 }
    );
  }

  // 🔒 Archive old structure
  await FeeStructure.updateOne(
    { _id: oldStructure._id },
    {
      isActive: false,
      isArchived: true,
      effectiveToMonth: effectiveFromMonth,
    }
  );

  // 🧠 Create NEW VERSION
  const newStructure = await FeeStructure.create({
    classId: oldStructure.classId,
    sectionId: oldStructure.sectionId,
    academicYear: oldStructure.academicYear,
    className: oldStructure.className,
    sectionName: oldStructure.sectionName,

    version: oldStructure.version + 1,
    effectiveFromMonth,
    effectiveToMonth: null,

    fees,
    applicableMonths: oldStructure.applicableMonths,
    isMonthly: oldStructure.isMonthly,
    isActive: true,
    remarks,
  });

  return NextResponse.json({
    success: true,
    message: "Fee structure updated with new version",
    data: newStructure,
  });
}

/* DELETE */
export async function DELETE(req, { params }) {
  await connectDB();

  await FeeStructure.updateOne(
    { _id: params.id },
    { isActive: false, isArchived: true }
  );

  return NextResponse.json({ success: true });
}
