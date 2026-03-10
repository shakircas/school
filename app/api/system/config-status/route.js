import connectDB from "@/lib/db";
import SystemConfig from "@/models/SystemConfig";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  // We only select the specific field to keep the payload tiny and fast
  const config = await SystemConfig.findOne({}).select("isMaintenanceMode");

  return NextResponse.json({
    isMaintenanceMode: config?.isMaintenanceMode || false,
  });
}
