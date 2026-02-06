import connectDB from "@/lib/db";
import SystemConfig from "@/models/SystemConfig";

export async function POST(req) {
  await connectDB();
  const { year } = await req.json();

  await SystemConfig.findOneAndUpdate(
    {},
    { activeAcademicYear: year },
    { upsert: true },
  );

  return Response.json({ success: true });
}
