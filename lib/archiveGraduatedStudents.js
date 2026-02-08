import mongoose from "mongoose";
import Student from "@/models/Student";

export async function archiveGraduatedStudents(graduationYear) {
  const archiveCollection = `students_archive_${graduationYear.replace("-", "_")}`;
  const db = mongoose.connection.db;

  // 1️⃣ Move graduated students
  await Student.aggregate([
    {
      $match: {
        status: "Graduated",
        graduationYear,
      },
    },
    { $out: archiveCollection },
  ]);

  // 2️⃣ Remove heavy indexes
  await db.collection(archiveCollection).dropIndexes();

  // 3️⃣ Remove from main collection
  await Student.deleteMany({
    status: "Graduated",
    graduationYear,
  });

  return {
    archivedCollection: archiveCollection,
  };
}
