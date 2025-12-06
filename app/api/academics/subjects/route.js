import { NextResponse } from "next/server";
import Subject from "@/models/Subject";
import { dbConnection } from "@/lib/db";

export async function GET() {
  await dbConnection();
  const data = await Subject.find();
  return NextResponse.json({ data });
}

export async function POST(req) {
  try {
    await dbConnection();
    const body = await req.json();
    const sub = await Subject.create(body);
    return NextResponse.json({ data: sub });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    await dbConnection();
    const body = await req.json();

    const updated = await Subject.findByIdAndUpdate(body._id, body, {
      new: true,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnection();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Subject.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
