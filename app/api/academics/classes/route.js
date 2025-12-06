import { NextResponse } from "next/server";
import Class from "@/app/models/Class";
import { dbConnection } from "@/config/db";

export async function GET() {
  await dbConnection();
  const data = await Class.find();
  return NextResponse.json({ data });
}

export async function POST(req) {
  try {
    await dbConnection();
    const body = await req.json();
    const cls = await Class.create(body);
    return NextResponse.json({ data: cls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    await dbConnection();
    const body = await req.json();

    const updated = await Class.findByIdAndUpdate(body._id, body, {
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

    await Class.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
