import mongoose from "mongoose";

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
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: false,
    },
    sectionId: {
      type: String,
      required: false,
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
);

attendanceSchema.index({
  date: 1,
  type: 1,
  classId: 1,
  sectionId: 1,
});

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
