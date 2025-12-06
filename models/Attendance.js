import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["Student", "Teacher"],
      required: true,
    },
    class: {
      type: String,
    },
    section: {
      type: String,
    },
    records: [
      {
        personId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "type",
          required: true,
        },
        name: String,
        rollNumber: String,
        status: {
          type: String,
          enum: ["Present", "Absent", "Late", "Leave", "Half Day"],
          required: true,
        },
        remarks: String,
        checkInTime: Date,
        checkOutTime: Date,
      },
    ],
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

attendanceSchema.index({ date: 1, type: 1, class: 1, section: 1 })

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)
