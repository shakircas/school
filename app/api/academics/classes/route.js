

// // app/api/academics/classes/route.js
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Class from "@/models/Class";
// import Student from "@/models/Student"; // optional - for studentCount

// export async function GET(req) {
//   await connectDB();
//   try {
//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search") || "";
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 10;
//     const sort = searchParams.get("sort") || "-createdAt";

//     const query = {};
//     if (search) {
//       // search by name or subject names
//       query.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { academicYear: { $regex: search, $options: "i" } },
//         { "subjects.name": { $regex: search, $options: "i" } },
//       ];
//     }

//     const [items, total] = await Promise.all([
//       Class.find(query)
//         .sort(sort)
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       Class.countDocuments(query),
//     ]);

//     // optionally attach student counts per class (if Student model exists)
//     const classNames = items.map((c) => c.name);
//     let counts = {};
//     if (Student) {
//       const agg = await Student.aggregate([
//         { $match: { class: { $in: classNames } } },
//         { $group: { _id: "$class", count: { $sum: 1 } } },
//       ]);
//       agg.forEach((a) => (counts[a._id] = a.count));
//     }

//     const data = items.map((c) => ({ ...c, studentCount: counts[c.name] || 0 }));

//     return NextResponse.json({
//       data,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("GET classes error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     // validate basic fields
//     if (!body.name) throw new Error("Class name is required");
//     if (!body.academicYear) throw new Error("Academic year is required");
//     if (!Array.isArray(body.sections)) throw new Error("Sections must be an array");

//     // normalize sections
//     body.sections = body.sections.map((s) => ({
//       name: s.name,
//       capacity: Number(s.capacity) || 40,
//       classTeacher: s.classTeacher || null,
//     }));

//     const created = await Class.create(body);
//     return NextResponse.json({ data: created });
//   } catch (err) {
//     console.error("POST classes error:", err);
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }

// export async function PUT(req) {
//   try {
//     await connectDB();
//     const body = await req.json();
//     if (!body._id) throw new Error("Class ID is required");

//     // normalize incoming
//     const updates = {
//       name: body.name,
//       academicYear: body.academicYear,
//       sections: (body.sections || []).map((s) => ({
//         name: s.name,
//         capacity: Number(s.capacity) || 40,
//         classTeacher: s.classTeacher || null,
//       })),
//       subjects: body.subjects || [],
//       feeStructure: body.feeStructure || {},
//       schedule: body.schedule || [],
//       status: body.status || "Active",
//     };

//     const updated = await Class.findByIdAndUpdate(body._id, updates, { new: true, runValidators: true });
//     return NextResponse.json({ data: updated });
//   } catch (err) {
//     console.error("PUT classes error:", err);
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }

// export async function DELETE(req) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) throw new Error("Class ID is required");

//     await Class.findByIdAndDelete(id);
//     return NextResponse.json({ message: "Deleted" });
//   } catch (err) {
//     console.error("DELETE classes error:", err);
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }

// app/api/academics/classes/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import mongoose from "mongoose";

/* -------------------------------------------------
   HELPERS
------------------------------------------------- */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function error(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/* -------------------------------------------------
   GET — List classes (paginated, searchable)
------------------------------------------------- */
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const sort = searchParams.get("sort") || "-createdAt";

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
        { "subjects.name": { $regex: search, $options: "i" } },
      ];
    }

    const [classes, total] = await Promise.all([
      Class.find(query)
        .populate("sections.classTeacher", "name")
        .populate("subjects.teacher", "name")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Class.countDocuments(query),
    ]);

    /* ---- student count (optimized & safe) ---- */
    const classIds = classes.map(c => c._id);
    const countsAgg = await Student.aggregate([
      { $match: { classId: { $in: classIds } } },
      { $group: { _id: "$classId", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    countsAgg.forEach(c => (countMap[c._id.toString()] = c.count));

    const data = classes.map(c => ({
      ...c,
      studentCount: countMap[c._id.toString()] || 0,
    }));

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET classes error", err);
    return error("Failed to load classes", 500);
  }
}

/* -------------------------------------------------
   POST — Create class (HARD VALIDATION)
------------------------------------------------- */
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    const { name, academicYear, sections = [], subjects = [], status } = body;

    if (!name || !academicYear) {
      return error("Class name and academic year are required");
    }

    // Duplicate protection (name + academicYear)
    const exists = await Class.findOne({ name, academicYear });
    if (exists) return error("Class already exists for this academic year");

    /* ---- Sections validation ---- */
    const sectionNames = sections.map(s => s.name);
    if (new Set(sectionNames).size !== sectionNames.length) {
      return error("Duplicate section names are not allowed");
    }

    sections.forEach(s => {
      if (!s.name) throw new Error("Section name required");
      if (s.capacity <= 0 || s.capacity > 100) {
        throw new Error("Section capacity must be between 1 and 100");
      }
      if (s.classTeacher && !isValidObjectId(s.classTeacher)) {
        throw new Error("Invalid class teacher ID");
      }
    });

    /* ---- Subject validation ---- */
    subjects.forEach(sub => {
      if (!sub.name) throw new Error("Subject name required");
      if (!isValidObjectId(sub.teacher)) {
        throw new Error(`Invalid teacher for subject ${sub.name}`);
      }
      if (sub.periods <= 0 || sub.periods > 10) {
        throw new Error(`Invalid periods for subject ${sub.name}`);
      }
    });

    /* ---- Teacher existence check ---- */
    const teacherIds = [
      ...sections.map(s => s.classTeacher).filter(Boolean),
      ...subjects.map(s => s.teacher),
    ];

    const teacherCount = await Teacher.countDocuments({ _id: { $in: teacherIds } });
    if (teacherCount !== teacherIds.length) {
      return error("One or more assigned teachers do not exist");
    }

    const created = await Class.create({
      ...body,
      status: status || "Active",
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("POST classes error", err);
    return error(err.message);
  }
}

/* -------------------------------------------------
   PUT — Update class (SAFE UPDATE)
------------------------------------------------- */
export async function PUT(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id || !isValidObjectId(_id)) {
      return error("Valid class ID required");
    }

    const existing = await Class.findById(_id);
    if (!existing) return error("Class not found", 404);

    // prevent duplicate on update
    if (body.name && body.academicYear) {
      const dup = await Class.findOne({
        _id: { $ne: _id },
        name: body.name,
        academicYear: body.academicYear,
      });
      if (dup) return error("Another class already exists with same name & year");
    }

    const updated = await Class.findByIdAndUpdate(
      _id,
      body,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PUT classes error", err);
    return error(err.message);
  }
}

/* -------------------------------------------------
   DELETE — Safe delete
------------------------------------------------- */
export async function DELETE(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !isValidObjectId(id)) return error("Valid class ID required");

    // prevent delete if students exist
    const studentExists = await Student.exists({ classId: id });
    if (studentExists) {
      return error("Cannot delete class with enrolled students");
    }

    await Class.findByIdAndDelete(id);
    return NextResponse.json({ message: "Class deleted" });
  } catch (err) {
    console.error("DELETE classes error", err);
    return error(err.message);
  }
}
