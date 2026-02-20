import mongoose from "mongoose";

const riskProfileSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      index: true,
    },

    sectionId: String,
    academicYear: String,

    attendanceScore: Number,
    academicScore: Number,
    trendScore: Number,

    subjectBreakdown: [
      {
        subject: String,
        average: Number,
      },
    ],

    finalRiskScore: Number,

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    lastCalculated: Date,
  },
  { timestamps: true },
);

export default mongoose.models.RiskProfile ||
  mongoose.model("RiskProfile", riskProfileSchema);
