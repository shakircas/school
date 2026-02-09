// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import mongoose from "mongoose";
// import Attendance from "@/models/Attendance";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const { year, recordId } = await req.json();

//     if (!year)
//       return NextResponse.json({ error: "Year is required" }, { status: 400 });

//     const collectionName = `attendances_${year.replace("-", "_")}`;
//     const db = mongoose.connection.db;
//     const archiveCol = db.collection(collectionName);

//     // 1. Build Query (Specific day or whole year)
//     const query = recordId
//       ? { _id: new mongoose.Types.ObjectId(recordId) }
//       : {};
//     const archivedData = await archiveCol.find(query).toArray();

//     if (archivedData.length === 0) {
//       return NextResponse.json(
//         { error: "No records found to restore" },
//         { status: 404 },
//       );
//     }

//     // 2. Insert into live Collection
//     // Note: We use insertMany for speed.
//     await Attendance.insertMany(archivedData);

//     // 3. Remove from archive
//     await archiveCol.deleteMany(query);

//     return NextResponse.json({
//       success: true,
//       message: `${archivedData.length} records restored to live database.`,
//     });
//   } catch (error) {
//     console.error("Restore Error:", error);
//     return NextResponse.json({ error: "Restoration failed" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";

export async function POST(req) {
  try {
    await connectDB();
    const { year, recordId } = await req.json();

    if (!year)
      return NextResponse.json({ error: "Year is required" }, { status: 400 });

    const archiveCollectionName = `attendances_${year.replace("-", "_")}`;
    const db = mongoose.connection.db;
    const archiveCol = db.collection(archiveCollectionName);

    // Build query: if recordId exists, restore one day. Otherwise, restore the whole year.
    const query = recordId
      ? { _id: new mongoose.Types.ObjectId(recordId) }
      : {};
    const archivedData = await archiveCol.find(query).toArray();

    if (archivedData.length === 0) {
      return NextResponse.json(
        { error: "No archived data found to restore" },
        { status: 404 },
      );
    }

    // 1. Move to Live (using insertMany for performance)
    // We use ordered: false so if one record exists, it continues with others
    try {
      await Attendance.insertMany(archivedData, { ordered: false });
    } catch (e) {
      // Ignore duplicate key errors if some records were already restored
      console.warn("Some records might already exist in live collection");
    }

    // 2. Remove from Archive
    await archiveCol.deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `${archivedData.length} records moved back to live database.`,
    });
  } catch (error) {
    console.error("Restore Error:", error);
    return NextResponse.json({ error: "Restoration failed" }, { status: 500 });
  }
}