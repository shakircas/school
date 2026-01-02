import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FeeStructure from "@/models/FeeStructure";
import Class from "@/models/Class";

/* =========================
   GET: List Fee Structures
========================= */
export async function GET() {
  await connectDB();

  const structures = await FeeStructure.find({ isActive: true }).sort({
    createdAt: -1,
  });

  return NextResponse.json({
    success: true,
    data: structures,
  });
}

/* =========================
   POST: Create Fee Structure
========================= */
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const {
    classId,
    sectionId,
    academicYear,
    fees,
    applicableMonths,
    isMonthly,
    remarks,
  } = body;

  if (!classId || !academicYear) {
    return NextResponse.json(
      { success: false, message: "Class and academic year required" },
      { status: 400 }
    );
  }

  // 🔍 Load class snapshot
  const cls = await Class.findById(classId);
  if (!cls) {
    return NextResponse.json(
      { success: false, message: "Class not found" },
      { status: 404 }
    );
  }

  const section = sectionId ? cls.sections.id(sectionId) : null;

  const feeStructure = await FeeStructure.create({
    classId,
    sectionId: sectionId || null,
    academicYear,
    className: cls.name,
    sectionName: section ? section.name : "All Sections",
    fees,
    applicableMonths,
    isMonthly,
    remarks,
  });

  return NextResponse.json({
    success: true,
    data: feeStructure,
  });
}
