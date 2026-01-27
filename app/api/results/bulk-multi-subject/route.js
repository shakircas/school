// import { NextResponse } from "next/server";
// import Result from "@/models/Result";
// import connectDB from "@/lib/db";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const { examId, classId, sectionId, data, subjectList } = await req.json();

//     const operations = data.map(async (row) => {
//       const studentId = row["Student ID"];

//       // Build the subjects array by scanning the row keys
//       const extractedSubjects = [];

//       subjectList.forEach((subName) => {
//         const obt = row[`${subName} (Obtained)`];
//         const tot = row[`${subName} (Total)`];

//         if (obt !== undefined && obt !== "") {
//           extractedSubjects.push({
//             subject: subName,
//             obtainedMarks: Number(obt),
//             totalMarks: Number(tot) || 100,
//             passingMarks: Math.ceil((Number(tot) || 100) * 0.33),
//             isAbsent: String(obt).toLowerCase() === "abs",
//           });
//         }
//       });

//       // Update or Create the Result document
//       return Result.findOneAndUpdate(
//         { exam: examId, student: studentId },
//         {
//           classId,
//           sectionId,
//           academicYear: "2025-2026",
//           subjects: extractedSubjects, // This replaces the whole array with the new Excel data
//         },
//         { upsert: true, new: true, runValidators: true },
//       );
//     });

//     await Promise.all(operations);

//     return NextResponse.json({ message: "Bulk update complete" });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import Result from "@/models/Result";
import connectDB from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();
    const { examId, classId, sectionId, data, subjectList } = await req.json();

    let summary = {
      totalProcessed: 0,
      updated: 0,
      created: 0,
      errors: [],
    };

    const operations = data.map(async (row) => {
      try {
        const studentId = row["Student ID"];
        if (!studentId) return;

        const extractedSubjects = [];
        subjectList.forEach((subName) => {
          const obt = row[`${subName} (Obtained)`];
          const tot = row[`${subName} (Total)`];

          if (obt !== undefined && obt !== "") {
            const isAbs = String(obt).toUpperCase() === "ABS";
            extractedSubjects.push({
              subject: subName,
              obtainedMarks: isAbs ? 0 : Number(obt),
              totalMarks: Number(tot) || 100,
              passingMarks: Math.ceil((Number(tot) || 100) * 0.33),
              isAbsent: isAbs,
            });
          }
        });

        // Use findOneAndUpdate with "upsert" and "raw result" to track if it's new or old
        const result = await Result.findOneAndUpdate(
          { exam: examId, student: studentId },
          {
            classId,
            sectionId,
            academicYear: "2025-2026",
            subjects: extractedSubjects,
          },
          { upsert: true, new: true, rawResult: true },
        );

        summary.totalProcessed++;
        if (result.lastErrorObject.updatedExisting) {
          summary.updated++;
        } else {
          summary.created++;
        }
      } catch (err) {
        summary.errors.push(`Student ${row["Student Name"]}: ${err.message}`);
      }
    });

    await Promise.all(operations);

    return NextResponse.json(
      {
        message: "Sync Complete",
        summary: summary,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}