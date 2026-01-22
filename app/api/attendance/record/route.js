import Attendance from "@/models/Attendance";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

// UPDATE Individual Student Status
export async function PATCH(req) {
  try {
    await connectDB();
    const { attendanceId, personId, status, remarks } = await req.json();

    const updated = await Attendance.findOneAndUpdate(
      {
        _id: attendanceId,
        "records.personId": personId,
      },
      {
        $set: {
          "records.$.status": status,
          "records.$.remarks": remarks || "",
          "records.$.markedAt": new Date(),
        },
      },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE Individual Student Record from the day
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const attendanceId = searchParams.get("attendanceId");
    const personId = searchParams.get("personId");

    const updated = await Attendance.findByIdAndUpdate(
      attendanceId,
      { $pull: { records: { personId: personId } } },
      { new: true }
    );

    return NextResponse.json({ message: "Student record removed", updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
