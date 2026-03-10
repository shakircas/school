import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    activeAcademicYear: {
      type: String,
      required: true,
      default: "2025-2026",
      trim: true,
      match: [/^\d{4}-\d{4}$/, "Please fill a valid academic year (YYYY-YYYY)"],
    },
    // Useful for locking the app during year-end transitions
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    // Track the last admin who modified global settings
    lastUpdatedBy: {
      type: String, // Email or User ID
    },
    // Can store school name or other global metadata here later
    institutionName: {
      type: String,
      default: "Academic Institution",
    },
  },
  {
    timestamps: true,
    // Ensures only one config document ever exists
    capped: { size: 1024, max: 1, autoIndexId: true },
  },
);

export default mongoose.models.SystemConfig ||
  mongoose.model("SystemConfig", systemConfigSchema);
