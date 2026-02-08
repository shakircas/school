// import { NextResponse } from "next/server";
// import Student from "@/models/Student";
// import connectDB from "@/lib/db";
// import { getActiveAcademicYear } from "@/lib/getAcademicYear";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const body = await req.json();
//     const { studentIds, nextClassId, isHighestClass } = body;

//     if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
//       return NextResponse.json(
//         { error: "No students selected" },
//         { status: 400 },
//       );
//     }

//     const activeAcademicYear = getActiveAcademicYear()

//     if (isHighestClass) {
//       const result = await Student.updateMany(
//         { _id: { $in: studentIds } },
//         {
//           $set: {
//             status: "Graduated",
//             admissionStatus: "withdrawn",
//             withdrawalDate: new Date(),
//             withdrawalReason: "Completed Class 10",
//             graduationYear: activeAcademicYear, // 🔥 KEY
//             lastClassId: currentClassId,
//           },
//         },
//       );
//     }


//     // PROMOTION LOGIC WITH ACADEMIC YEAR SHIFT
//     if (!nextClassId) {
//       return NextResponse.json(
//         { error: "Next Class ID required" },
//         { status: 400 },
//       );
//     }

//     /**
//      * To update the academic year, we first find one student to see the current format,
//      * or we can assume a YYYY-YY format.
//      */
//     const sampleStudent = await Student.findById(studentIds[0]).select(
//       "academicYear",
//     );
//     let nextYear = sampleStudent?.academicYear;

//     if (nextYear && nextYear.includes("-")) {
//       const parts = nextYear.split("-");
//       const startYear = parseInt(parts[0]);
//       const endYearShort = parseInt(parts[1]);
//       // Converts "2025-26" -> "2026-27"
//       nextYear = `${startYear + 1}-${endYearShort + 1}`;
//     }

//     const result = await Student.updateMany(
//       { _id: { $in: studentIds } },
//       {
//         $set: {
//           classId: nextClassId,
//           academicYear: nextYear, // Updates session
//           sectionId: "all", // Resets section for new class placement
//         },
//       },
//     );

//     return NextResponse.json({
//       message: `Successfully promoted ${result.modifiedCount} students to session ${nextYear}.`,
//     });
//   } catch (error) {
//     console.error("Promotion Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import Student from "@/models/Student";
import connectDB from "@/lib/db";
import { getActiveAcademicYear } from "@/lib/getAcademicYear";
import { archiveGraduatedStudents } from "@/lib/archiveGraduatedStudents";

function getNextAcademicYear(current) {
  // "2025-2026" → "2026-2027"
  const [start, end] = current.split("-").map(Number);
  return `${start + 1}-${end + 1}`;
}

export async function POST(req) {
  try {
    await connectDB();

    const { studentIds, nextClassId, isHighestClass, currentClassId } =
      await req.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "No students selected" },
        { status: 400 },
      );
    }

    if (!currentClassId) {
      return NextResponse.json(
        { error: "currentClassId is required" },
        { status: 400 },
      );
    }

    const activeAcademicYear = getActiveAcademicYear(); // "2025-2026"

    /**
     * 🎓 CASE 1: GRADUATION (Class 10)
     */
    if (isHighestClass) {
      const result = await Student.updateMany(
        { _id: { $in: studentIds } },
        {
          $set: {
            status: "Graduated",
            admissionStatus: "withdrawn",
            withdrawalDate: new Date(),
            withdrawalReason: "Completed Final Class",
            graduationYear: activeAcademicYear,
            lastClassId: currentClassId,
          },
        },
      );

      // 🔥 AUTO ARCHIVE
      // await archiveGraduatedStudents(activeAcademicYear);

      // return NextResponse.json({
      //   message: "Students graduated and archived successfully",
      // });

      return NextResponse.json({
        success: true,
        message: `🎓 ${result.modifiedCount} students graduated successfully.`,
      });
    }

    /**
     * ⬆️ CASE 2: PROMOTION
     */
    if (!nextClassId) {
      return NextResponse.json(
        { error: "nextClassId is required for promotion" },
        { status: 400 },
      );
    }

    const nextAcademicYear = getNextAcademicYear(activeAcademicYear);

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          classId: nextClassId,
          academicYear: nextAcademicYear,
          sectionId: "all", // re-assign later
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: `⬆️ ${result.modifiedCount} students promoted to ${nextAcademicYear}.`,
    });
  } catch (error) {
    console.error("Promotion / Graduation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
