// app/api/academics/classes/teacher-report/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";

export async function GET() {
  try {
    await connectDB();
    const classes = await Class.find().lean();

    const map = {}; // teacherNameOrId -> { subjects: Set, classes: Set }

    classes.forEach((c) => {
      const className = c.name;
      // sections.classTeacher
      (c.sections || []).forEach((s) => {
        const t = s.classTeacher || null;
        if (!t) return;
        const key = String(t);
        if (!map[key])
          map[key] = { teacher: t, subjects: new Set(), classes: new Set() };
        map[key].classes.add(className);
      });

      (c.subjects || []).forEach((s) => {
        const t = s.teacher || null;
        if (!t) return;
        const key = String(t);
        if (!map[key])
          map[key] = { teacher: t, subjects: new Set(), classes: new Set() };
        map[key].subjects.add(s.name || s.code || "Unknown");
        map[key].classes.add(className);
      });
    });

    // CSV
    const headers = [
      "teacher",
      "subjects_count",
      "classes_count",
      "subjects_list",
      "classes_list",
    ];
    const rows = Object.values(map).map((m) => {
      const subjects = Array.from(m.subjects).join("|");
      const classesList = Array.from(m.classes).join("|");
      return [
        String(m.teacher),
        m.subjects.size,
        m.classes.size,
        `"${subjects}"`,
        `"${classesList}"`,
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="teacher_report_${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("teacher report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
