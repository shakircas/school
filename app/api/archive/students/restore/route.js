// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Student from "@/models/Student";
// import connectDB from "@/lib/db";

// export async function POST(req) {
//   try {
//     await connectDB();

//     const { academicYear, studentId } = await req.json();

//     if (!academicYear) {
//       return NextResponse.json(
//         { error: "academicYear is required" },
//         { status: 400 },
//       );
//     }

//     const archiveCollection = `students_archive_${academicYear.replace("-", "_")}`;
//     const db = mongoose.connection.db;
//     const archiveCol = db.collection(archiveCollection);

//     // 1️⃣ Fetch data to restore
//     const query = studentId
//       ? { _id: new mongoose.Types.ObjectId(studentId) }
//       : {};
//     const archivedStudents = await archiveCol.find(query).toArray();

//     if (!archivedStudents.length) {
//       return NextResponse.json(
//         { error: "No students found to restore" },
//         { status: 404 },
//       );
//     }

//     // 2️⃣ Prevent duplicate restore
//     const existingIds = (
//       await Student.find(
//         { _id: { $in: archivedStudents.map((s) => s._id) } },
//         { _id: 1 },
//       )
//     ).map((s) => s._id.toString());

//     const studentsToRestore = archivedStudents.filter(
//       (s) => !existingIds.includes(s._id.toString()),
//     );

//     if (!studentsToRestore.length) {
//       return NextResponse.json({
//         success: true,
//         message: "Students already restored",
//       });
//     }

//     // 3️⃣ Restore into main collection
//     await Student.insertMany(studentsToRestore);

//     // 4️⃣ Remove restored docs from archive
//     await archiveCol.deleteMany({
//       _id: { $in: studentsToRestore.map((s) => s._id) },
//     });

//     return NextResponse.json({
//       success: true,
//       restoredCount: studentsToRestore.length,
//       message: "Students restored successfully",
//     });
//   } catch (error) {
//     console.error("Restore Students Error:", error);
//     return NextResponse.json({ error: "Restore failed" }, { status: 500 });
//   }
// }

import mongoose from "mongoose";
import Student from "@/models/Student";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { graduationYear, classId, studentId } = await req.json();

    if (!graduationYear || !classId) {
      return NextResponse.json(
        { error: "graduationYear and classId are required" },
        { status: 400 },
      );
    }

    const archiveCollection = `students_archive_${graduationYear.replace("-", "_")}`;
    const db = mongoose.connection.db;
    const archiveCol = db.collection(archiveCollection);

    // 1️⃣ Build query
    const query = {
      lastClassId: new mongoose.Types.ObjectId(classId),
    };

    if (studentId) {
      query._id = new mongoose.Types.ObjectId(studentId);
    }

    const archivedStudents = await archiveCol.find(query).toArray();

    if (!archivedStudents.length) {
      return NextResponse.json(
        { error: "No students found to restore" },
        { status: 404 },
      );
    }

    // 2️⃣ Prevent duplicate restore
    const existingIds = (
      await Student.find(
        { _id: { $in: archivedStudents.map((s) => s._id) } },
        { _id: 1 },
      )
    ).map((s) => s._id.toString());

    const studentsToRestore = archivedStudents.filter(
      (s) => !existingIds.includes(s._id.toString()),
    );

    if (!studentsToRestore.length) {
      return NextResponse.json({
        success: true,
        message: "Students already restored",
      });
    }

    // 3️⃣ Restore
    await Student.insertMany(studentsToRestore);

    // 4️⃣ Remove from archive
    await archiveCol.deleteMany({
      _id: { $in: studentsToRestore.map((s) => s._id) },
    });

    return NextResponse.json({
      success: true,
      restoredCount: studentsToRestore.length,
      message: "Students restored successfully",
    });
  } catch (error) {
    console.error("Restore Students Error:", error);
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
