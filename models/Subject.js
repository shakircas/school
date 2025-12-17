import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },

    description: String,
    department: String,
    type: {
      type: String,
      enum: ["Compulsory", "Elective", "Optional"],
      default: "Compulsory",
    },

    // ✅ Use Class references (NOT strings)
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],

    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],

    syllabus: [
      {
        chapter: String,
        topics: [String],
        estimatedHours: Number,
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

/* ---- Indexes ---- */
subjectSchema.index({ name: 1 });

export default mongoose.models.Subject ||
  mongoose.model("Subject", subjectSchema);
