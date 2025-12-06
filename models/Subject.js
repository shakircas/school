import mongoose from "mongoose"

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    department: String,
    type: {
      type: String,
      enum: ["Core", "Elective", "Optional"],
      default: "Core",
    },
    classes: [String],
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
  {
    timestamps: true,
  },
)

subjectSchema.index({ name: 1 })
subjectSchema.index({ code: 1 })

export default mongoose.models.Subject || mongoose.model("Subject", subjectSchema)
