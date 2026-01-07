import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fee from "@/models/Fee";
import Student from "@/models/Student";

/* =========================
   GET: List Fees
========================= */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const academicYear = searchParams.get("academicYear");
    const month = searchParams.get("month");
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const version = searchParams.get("version");

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear is required" },
        { status: 400 }
      );
    }

    /* ✅ Build query SAFELY */
    const query = { academicYear };

    if (month) query.month = month;
    if (status && status !== "All") query.status = status;
    if (classId && classId !== "all") query.classId = classId;
    if (sectionId && sectionId !== "all") query.sectionId = sectionId;
   if (version && !isNaN(Number(version))) {
     query["feeStructureMeta.version"] = Number(version);
   }


    /* 🔍 Search students */
    if (search) {
      const students = await Student.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      query.student = { $in: students.map((s) => s._id) };
    }

    const [fees, total] = await Promise.all([
      Fee.find(query)
        .populate("student", "name rollNumber")
        .populate("classId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Fee.countDocuments(query),
    ]);

    return NextResponse.json({
      data: fees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch fees" },
      { status: 500 }
    );
  }
}

/* =========================
   POST: Manual Fee Entry
========================= */
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    /* 🚫 Prevent duplicates */
    const exists = await Fee.findOne({
      student: data.student,
      academicYear: data.academicYear,
      month: data.month,
    });

    if (exists) {
      return NextResponse.json(
        { error: "Fee already exists for this student and month" },
        { status: 409 }
      );
    }

    /* 🧾 Invoice */
    const count = await Fee.countDocuments();
    data.invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(6, "0")}`;

    /* 💰 Calculations */
    data.netAmount = data.totalAmount - (data.discount || 0) + (data.fine || 0);

    data.dueAmount = data.netAmount - (data.paidAmount || 0);

    /* ⚠️ ENSURE feeStructureMeta EXISTS */
    if (!data.feeStructureMeta) {
      data.feeStructureMeta = {
        version: 1,
        effectiveFromMonth: data.month,
        source: "manual",
      };
    }



    const fee = new Fee(data);

    /* 🔁 Auto status */
    if (data.dueAmount === 0) {
      fee.status = "Paid";
    } else if (data.paidAmount > 0) {
      fee.status = "Partial";
    }

    await fee.save();

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    console.error("Error creating fee:", error);
    return NextResponse.json(
      { error: "Failed to create fee" },
      { status: 500 }
    );
  }
}
