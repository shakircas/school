// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Student from "@/models/Student";
// import connectDB from "@/lib/db";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const { academicYear } = await req.json();

//     if (!academicYear) {
//       return NextResponse.json(
//         { error: "academicYear is required" },
//         { status: 400 },
//       );
//     }

//     const archiveCollection = `students_archive_${academicYear.replace("-", "_")}`;

//     // 1️⃣ Copy data
//     await Student.aggregate([
//       { $match: { academicYear } },
//       { $out: archiveCollection },
//     ]);

//     // 2️⃣ Drop indexes on archive to save space
//     const db = mongoose.connection.db;
//     await db.collection(archiveCollection).dropIndexes();

//     // 3️⃣ Delete archived data from main collection
//     await Student.deleteMany({ academicYear });

//     return NextResponse.json({
//       success: true,
//       message: `Students archived for ${academicYear}`,
//       archiveCollection,
//     });
//   } catch (error) {
//     console.error("Student Archiving Error:", error);
//     return NextResponse.json({ error: "Archiving failed" }, { status: 500 });
//   }
// }

import connectDB from "@/lib/db";
import mongoose from "mongoose";
import Student from "@/models/Student";

export async function POST(req) {
  await connectDB();

  const { graduationYear, classId } = await req.json();

  if (!graduationYear || !classId) {
    return Response.json(
      { error: "graduationYear and classId are required" },
      { status: 400 },
    );
  }

  const archiveCollection = `students_archive_${graduationYear.replace("-", "_")}`;
  const db = mongoose.connection.db;

  // 1️⃣ Copy ONLY graduating class students
  await Student.aggregate([
    {
      $match: {
        classId: new mongoose.Types.ObjectId(classId),
        graduationYear,
      },
    },
    {
      $addFields: {
        archivedAt: new Date(),
        lastClassId: "$classId",
        originalStudentId: "$_id",
      },
    },
    { $out: archiveCollection },
  ]);

  // 2️⃣ Drop indexes for archive (lighter DB)
  await db
    .collection(archiveCollection)
    .dropIndexes()
    .catch(() => {});

  // 3️⃣ Remove archived students from main collection
  await Student.deleteMany({
    classId: new mongoose.Types.ObjectId(classId),
    graduationYear,
  });

  return Response.json({
    success: true,
    message: "Students archived successfully",
    archiveCollection,
  });
}
