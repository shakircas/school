import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Fee from "@/models/Fee";
import FeeStructure from "@/models/FeeStructure";

export async function POST(req) {
  await connectDB();
  const { academicYear, month, dueDate, classId, sectionId } = await req.json();
  console.log(academicYear, month, dueDate, classId, sectionId);

  if (!academicYear || !month || !dueDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const students = await Student.find({
    // academicYear,
    status: "Active",
    ...(classId && { classId }),
    ...(sectionId && { sectionId }),
  });

  console.log(students);

  let created = 0;
  let skipped = 0;

  for (const student of students) {
    const exists = await Fee.findOne({
      student: student._id,
      academicYear,
      month,
    });

    if (exists) {
      skipped++;
      continue;
    }

    const structure =
      (await FeeStructure.findOne({
        classId: student.classId,
        sectionId: student.sectionId, // "A"
        academicYear,
        isActive: true,
      })) ||
      (await FeeStructure.findOne({
        classId: student.classId,
        sectionId: "all",
        academicYear,
        isActive: true,
      }));

    if (!structure) {
      skipped++;
      continue;
    }

    // 🔐 Month applicability check
    if (
      structure.applicableMonths.length &&
      !structure.applicableMonths.includes(month)
    ) {
      skipped++;
      continue;
    }

    const totalAmount = Object.values(structure.fees).reduce(
      (s, v) => s + v,
      0
    );

    const count = await Fee.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(6, "0")}`;

    await Fee.create({
      invoiceNumber,
      student: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      classId: student.classId,
      sectionId: student.sectionId,
      className: student.className,
      sectionName: student.sectionName,
      academicYear,
      month,
      feeStructure: structure.fees,
      totalAmount,
      netAmount: totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      dueDate,
      status: "Pending",
    });

    created++;
  }

  return NextResponse.json({ success: true, created, skipped });
}

// ✅ GET: Fetch fee structure for classes
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear"); // optional filter
    const classId = searchParams.get("classId"); // optional filter
    const sectionId = searchParams.get("sectionId"); // optional filter

    const query = { isActive: true };
    if (academicYear) query.academicYear = academicYear;
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const feeStructures = await FeeStructure.find(query).sort({
      classId: 1,
      sectionId: 1,
    });

    return NextResponse.json({ success: true, data: feeStructures });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch fee structures" },
      { status: 500 }
    );
  }
}
