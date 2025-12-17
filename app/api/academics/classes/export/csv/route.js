// app/api/academics/classes/export/csv/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = Number(searchParams.get("limit")) || 1000;
    const page = Number(searchParams.get("page")) || 1;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
      ];
    }

    const classes = await Class.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Header
    const headers = [
      "name",
      "academicYear",
      "sections",
      "subjects",
      "totalCapacity",
    ];
    const rows = classes.map((c) => {
      const sections = (c.sections || [])
        .map((s) => s.name + ":" + (s.capacity || ""))
        .join("|");
      const subjects = (c.subjects || []).map((s) => s.name).join("|");
      const totalCapacity = (c.sections || []).reduce(
        (a, b) => a + (b.capacity || 0),
        0
      );
      return [
        c.name,
        c.academicYear,
        `"${sections}"`,
        `"${subjects}"`,
        totalCapacity,
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="classes_${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("classes csv export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
