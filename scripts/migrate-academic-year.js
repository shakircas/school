import connectDB from "../lib/db.js";
import SystemConfig from "../models/SystemConfig.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";

const ACADEMIC_YEAR = "2025-2026";

async function migrateAcademicYear() {
  try {
    console.log("🔌 Connecting to database...");
    await connectDB();

    /* ----------------------------------
       1️⃣ System Config
    ---------------------------------- */
    console.log("⚙️ Setting active academic year...");

    await SystemConfig.findOneAndUpdate(
      {},
      { activeAcademicYear: ACADEMIC_YEAR },
      { upsert: true, new: true },
    );

    console.log(`✅ Academic Year set to ${ACADEMIC_YEAR}`);

    /* ----------------------------------
       2️⃣ Students Migration
    ---------------------------------- */
    console.log("👨‍🎓 Migrating students...");

    const studentResult = await Student.updateMany(
      { academicYear: { $exists: false } },
      { $set: { academicYear: ACADEMIC_YEAR } },
    );

    console.log(`✅ Students updated: ${studentResult.modifiedCount}`);

    /* ----------------------------------
       3️⃣ Attendance Migration
    ---------------------------------- */
    console.log("📅 Migrating attendance records...");

    const attendanceResult = await Attendance.updateMany(
      { academicYear: { $exists: false } },
      { $set: { academicYear: ACADEMIC_YEAR } },
    );

    console.log(
      `✅ Attendance records updated: ${attendanceResult.modifiedCount}`,
    );

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateAcademicYear();
