import SystemConfig from "../models/SystemConfig.js";
import connectDB from "../lib/db.js";

let cachedYear = null;

export async function getActiveAcademicYear() {
  if (cachedYear) return cachedYear;

  await connectDB();
  const config = await SystemConfig.findOne().lean();
  cachedYear = config?.activeAcademicYear || "2025-2026";

  return cachedYear;
}
