import { NextResponse } from "next/server";
import Admission from "@/models/Admission";
import connectDB from "@/lib/db";

// GET ALL ADMISSIONS with filters + pagination
export async function GET(req) {
  try {
    await connectDB();

    const {
      search,
      class: cls,
      section,
      status,
      page = 1,
      limit = 25,
    } = Object.fromEntries(req.nextUrl.searchParams);

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (cls) query.class = cls;
    if (section) query.section = section;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [admissions, total] = await Promise.all([
      Admission.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Admission.countDocuments(query),
    ]);

    return NextResponse.json({
      admissions,
      total,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//  CREATE NEW ADMISSION

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const body = {};

    // Extract all text fields
    formData.forEach((value, key) => {
      if (key !== "photo") body[key] = value;
    });

    // Handle Photo
    // let photoUrl = null;
    // const file = formData.get("photo");

    // if (file && file.size > 0) {
    //   photoUrl = await uploadImage(file); // your custom upload logic
    // }

    const newAdmission = await Admission.create({
      ...body,
    //   photo: photoUrl,
    });

    return NextResponse.json(newAdmission, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
