import mongoose from "mongoose";

const studentFeatureSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },

    academicYear: String,

    attendance: Number,
    midterm: Number,
    unit_avg: Number,
    previous_exam: Number,

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.models.StudentFeature ||
  mongoose.model("StudentFeature", studentFeatureSchema);
