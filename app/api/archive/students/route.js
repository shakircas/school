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

  // Add this check after the Student.aggregate line:
  const archiveExists = await db
    .listCollections({ name: archiveCollection })
    .hasNext();
  if (!archiveExists) {
    return Response.json(
      { success: false, error: "Archive collection creation failed." },
      { status: 500 },
    );
  }
  // ONLY THEN proceed to deleteMany

  // 3️⃣ Remove archived students from main collection
  await Student.deleteMany({
    classId: new mongoose.Types.ObjectId(classId),
    graduationYear,
  });
  console.log(archiveCollection);

  return Response.json({
    success: true,
    message: "Students archived successfully",
    archiveCollection,
  });
}
