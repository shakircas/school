import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Fee from "@/models/Fee";
import FeeStructure from "@/models/FeeStructure";

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(req) {
  await connectDB();

  try {
    const { academicYear, month, dueDate, classId, sectionId } =
      await req.json();

    if (!academicYear || !month || !dueDate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const students = await Student.find({
      status: "Active",
      ...(classId && { classId }),
      ...(sectionId && { sectionId }),
    });

    let created = 0;
    let skipped = 0;
    const usedStructureIds = new Set(); // ✅ MOVED outside the loop

    // Get starting invoice counter to avoid repeated DB calls inside loop
    let invoiceCounter = await Fee.countDocuments();

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

      // Find applicable structure
      const structure = await FeeStructure.findOne({
        classId: student.classId,
        $or: [{ sectionId: student.sectionId }, { sectionId: "all" }],
        academicYear,
        isActive: true,
        effectiveFromMonth: { $lte: month },
        $or: [
          { effectiveToMonth: null },
          { effectiveToMonth: { $gte: month } },
        ],
      }).sort({ sectionId: 1, version: -1 }); // Prioritize specific section over 'all'

      if (
        !structure ||
        (structure.applicableMonths?.length &&
          !structure.applicableMonths.includes(month))
      ) {
        skipped++;
        continue;
      }

      const totalAmount = Object.values(structure.fees).reduce(
        (s, v) => s + v,
        0
      );

      invoiceCounter++;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
        invoiceCounter
      ).padStart(6, "0")}`;

      const scholarship = student.scholarshipAmount || 0;
      const netAmount = Math.max(0, totalAmount - scholarship);
      const due = new Date(dueDate);

      const installments = [
        { amount: netAmount / 2, due },
        { amount: netAmount / 2, due: addMonths(due, 1) },
      ];

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
        feeStructureMeta: {
          feeStructureId: structure._id,
          version: structure.version,
          effectiveFromMonth: structure.effectiveFromMonth,
        },
        totalAmount,
        scholarship,
        netAmount,
        paidAmount: 0,
        dueAmount: netAmount,
        installments,
        dueDate,
        status: "Pending",
      });

      usedStructureIds.add(structure._id.toString());
      created++;
    }

    // Bulk update structures used
    if (usedStructureIds.size > 0) {
      await FeeStructure.updateMany(
        { _id: { $in: Array.from(usedStructureIds) } },
        {
          $set: { isLocked: true, lockedAt: new Date() },
          $inc: { generatedCount: 1 },
        }
      );
    }

    return NextResponse.json({ success: true, created, skipped });
  } catch (error) {
    console.error("Fee Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
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
