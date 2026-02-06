import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { academicYear } = await req.json();
    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const [startYear, endYear] = academicYear.split("-");
    const startDate = new Date(`20${startYear}-04-01`);
    const endDate = new Date(`20${endYear}-04-01`);

    const archiveCollection = `attendances_${academicYear.replace("-", "_")}`;
    const db = mongoose.connection.db;

    // ✅ Safety check
    const exists = await db
      .listCollections({ name: archiveCollection })
      .toArray();

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "Attendance already archived for this year" },
        { status: 409 },
      );
    }

    // 1️⃣ Copy data
    await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      { $out: archiveCollection },
    ]);

    // 2️⃣ Drop indexes
    await db.collection(archiveCollection).dropIndexes();

    // 3️⃣ Delete from live
    await Attendance.deleteMany({
      date: { $gte: startDate, $lt: endDate },
    });

    return NextResponse.json({
      success: true,
      message: `Attendance archived for ${academicYear}`,
      archiveCollection,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Archiving failed" }, { status: 500 });
  }
}
