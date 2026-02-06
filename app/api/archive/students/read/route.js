// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import connectDB from "@/lib/db";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const { academicYear, limit = 100, skip = 0 } = await req.json();

//     if (!academicYear) {
//       return NextResponse.json(
//         { error: "academicYear is required" },
//         { status: 400 },
//       );
//     }

//     const archiveCollection = `students_archive_${academicYear.replace("-", "_")}`;
//     const db = mongoose.connection.db;

//     const students = await db
//       .collection(archiveCollection)
//       .find({})
//       .skip(skip)
//       .limit(limit)
//       .toArray();

//     return NextResponse.json({
//       success: true,
//       students,
//     });
//   } catch (error) {
//     console.error("Read Archived Students Error:", error);
//     return NextResponse.json(
//       { error: "Failed to read archived students" },
//       { status: 500 },
//     );
//   }
// }

import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function POST(req) {
  await connectDB();

  const { graduationYear, classId } = await req.json();

  if (!graduationYear || !classId) {
    return Response.json(
      { error: "graduationYear and classId required" },
      { status: 400 },
    );
  }

  const collection = `students_archive_${graduationYear.replace("-", "_")}`;
  const db = mongoose.connection.db;

  const students = await db
    .collection(collection)
    .find({
      lastClassId: new mongoose.Types.ObjectId(classId),
    })
    .toArray();

  return Response.json({ success: true, students });
}
