import { NextResponse } from "next/server";
import Student from "@/models/Student";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentIds, nextClassId, isHighestClass } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "No students selected" },
        { status: 400 },
      );
    }

    if (isHighestClass) {
      // ARCHIVE LOGIC
      const result = await Student.updateMany(
        { _id: { $in: studentIds } },
        {
          $set: {
            status: "Graduated",
            admissionStatus: "withdrawn",
            withdrawalDate: new Date(),
            withdrawalReason: "Academic Cycle Completion - Graduated",
          },
        },
      );
      return NextResponse.json({
        message: `Archived ${result.modifiedCount} students.`,
      });
    }

    // PROMOTION LOGIC WITH ACADEMIC YEAR SHIFT
    if (!nextClassId) {
      return NextResponse.json(
        { error: "Next Class ID required" },
        { status: 400 },
      );
    }

    /**
     * To update the academic year, we first find one student to see the current format,
     * or we can assume a YYYY-YY format.
     */
    const sampleStudent = await Student.findById(studentIds[0]).select(
      "academicYear",
    );
    let nextYear = sampleStudent?.academicYear;

    if (nextYear && nextYear.includes("-")) {
      const parts = nextYear.split("-");
      const startYear = parseInt(parts[0]);
      const endYearShort = parseInt(parts[1]);
      // Converts "2025-26" -> "2026-27"
      nextYear = `${startYear + 1}-${endYearShort + 1}`;
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          classId: nextClassId,
          academicYear: nextYear, // Updates session
          sectionId: "all", // Resets section for new class placement
        },
      },
    );

    return NextResponse.json({
      message: `Successfully promoted ${result.modifiedCount} students to session ${nextYear}.`,
    });
  } catch (error) {
    console.error("Promotion Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
