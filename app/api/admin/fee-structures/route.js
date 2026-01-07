import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FeeStructure from "@/models/FeeStructure";
import Class from "@/models/Class";

/* =========================
   GET: List Fee Structures
========================= */
export async function GET() {
  await connectDB();

  const structures = await FeeStructure.find({ isActive: true }).populate("classId", "name").sort({
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
  try {
    await connectDB();

    const body = await req.json();

    const {
      academicYear,
      classId,
      sectionId = "all",
      fees,
      isMonthly = true,
      applicableMonths = [],
      effectiveFromMonth,
      effectiveToMonth = null,
      remarks,
    } = body;

    /* ======================
       BASIC VALIDATION
    ====================== */
    if (!academicYear || !classId || !effectiveFromMonth) {
      return NextResponse.json(
        { error: "academicYear, classId & effectiveFromMonth are required" },
        { status: 400 }
      );
    }

    /* ======================
       SNAPSHOT CLASS NAME
    ====================== */
    const cls = await Class.findById(classId).lean();
    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const className = cls.name;
    const sectionName = sectionId === "all" ? "All Sections" : sectionId;

    /* ======================
       FIND LAST VERSION
    ====================== */
    const last = await FeeStructure.findOne({
      academicYear,
      classId,
      sectionId,
    })
      .sort({ version: -1 })
      .lean();

    const lastVersion =
      last && Number.isFinite(Number(last.version)) ? Number(last.version) : 0;

    const nextVersion = lastVersion + 1;

    /* ======================
       ARCHIVE & LOCK OLD VERSION
    ====================== */
    if (last) {
      await FeeStructure.updateOne(
        { _id: last._id },
        {
          $set: {
            isArchived: true,
            isLocked: true,
            lockedAt: new Date(),
            effectiveToMonth: effectiveFromMonth || last.effectiveToMonth,
          },
        }
      );
    }

    /* ======================
       CREATE NEW VERSION
    ====================== */
    const feeStructure = await FeeStructure.create({
      academicYear,
      classId,
      sectionId,

      // snapshots
      className,
      sectionName,

      fees,
      isMonthly,
      applicableMonths: isMonthly ? [] : applicableMonths,

      version: nextVersion,
      effectiveFromMonth,
      effectiveToMonth,

      feeStructureMeta: {
        structureId: last
          ? last.feeStructureMeta?.structureId || last._id
          : undefined,
        version: nextVersion,
        effectiveFromMonth,
      },

      isActive: true,
      isArchived: false,
      isLocked: false,

      generatedCount: 0,
      remarks,
    });

    return NextResponse.json(feeStructure, { status: 201 });
  } catch (err) {
    console.error("FeeStructure POST error:", err);
    return NextResponse.json(
      { error: "Failed to create fee structure" },
      { status: 500 }
    );
  }
}
