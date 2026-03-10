import connectDB from "@/lib/db";
import SystemConfig from "@/models/SystemConfig";
import AuditLog from "@/models/AuditLog"; // New model for tracking changes
import { auth } from "@/auth";

export async function POST(req) {
  try {
    await connectDB();

    // 1. Authentication Check (Safety First)
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { year } = await req.json();

    // 2. Strict Validation
    if (!year || !/^\d{4}-\d{4}$/.test(year)) {
      return Response.json(
        { error: "Invalid academic year format (YYYY-YYYY)" },
        { status: 400 },
      );
    }

    // 3. Fetch current state before update for the audit log
    const currentConfig = await SystemConfig.findOne({});
    const oldYear = currentConfig?.activeAcademicYear || "Initial Setup";

    // 4. Perform Atomic Update
    const updatedConfig = await SystemConfig.findOneAndUpdate(
      {},
      {
        activeAcademicYear: year,
        lastUpdatedBy: session.user.email,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // 5. Create Audit Log Entry
    await AuditLog.create({
      action: "UPDATE_ACADEMIC_YEAR",
      oldValue: oldYear,
      newValue: year,
      performedBy: session.user.email,
      timestamp: new Date(),
      metadata: { ip: req.headers.get("x-forwarded-for") },
    });

    return Response.json({
      success: true,
      activeYear: updatedConfig.activeAcademicYear,
    });
  } catch (error) {
    console.error("SYSTEM_CONFIG_ERROR:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Fetch history and current config
export async function GET() {
  try {
    await connectDB();
    
    const config = await SystemConfig.findOne({});
    const logs = await AuditLog.find({ action: "UPDATE_ACADEMIC_YEAR" })
      .sort({ timestamp: -1 })
      .limit(10);

    return Response.json({
      activeAcademicYear: config?.activeAcademicYear || "2025-2026",
      isMaintenanceMode: config?.isMaintenanceMode || false,
      history: logs
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}