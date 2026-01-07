import connectDB from "@/lib/db";
import FeeStructure from "@/models/FeeStructure";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const academicYear = searchParams.get("academicYear");

  const structures = await FeeStructure.find({
    classId,
    academicYear,
  }).sort({ version: 1 });

  if (structures.length < 2) {
    return NextResponse.json({ error: "Not enough versions" }, { status: 400 });
  }

  const comparisons = [];

  for (let i = 1; i < structures.length; i++) {
    const prev = structures[i - 1];
    const curr = structures[i];

    const changes = {};

    Object.keys(curr.fees).forEach((key) => {
      const oldVal = prev.fees[key] || 0;
      const newVal = curr.fees[key] || 0;

      if (oldVal !== newVal) {
        changes[key] = {
          old: oldVal,
          new: newVal,
          diff: newVal - oldVal,
        };
      }
    });

    comparisons.push({
      fromVersion: prev.version,
      toVersion: curr.version,
      changes,
    });
  }

  return NextResponse.json({
    classId,
    academicYear,
    comparisons, // array of version-to-version changes
  });
}
