import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    activeAcademicYear: {
      type: String,
      required: true,
      default: "2025-2026",
    },
  },
  { timestamps: true },
);

export default mongoose.models.SystemConfig ||
  mongoose.model("SystemConfig", systemConfigSchema);
