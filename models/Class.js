import mongoose from "mongoose"

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sections: [
      {
        name: String,
        capacity: Number,
        classTeacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
      },
    ],
    academicYear: {
      type: String,
      required: true,
    },
    subjects: [
      {
        name: String,
        code: String,
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        periods: Number,
      },
    ],
    feeStructure: {
      tuitionFee: Number,
      admissionFee: Number,
      examFee: Number,
      labFee: Number,
      libraryFee: Number,
      sportsFee: Number,
      computerFee: Number,
      otherFee: Number,
    },
    schedule: [
      {
        day: String,
        periods: [
          {
            time: String,
            subject: String,
            teacher: String,
          },
        ],
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

classSchema.index({ name: 1, academicYear: 1 })

export default mongoose.models.Class || mongoose.model("Class", classSchema)
