import { getActiveAcademicYear } from "../lib/getAcademicYear.js";
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      // required: true,
      index: true,
    },

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

attendanceSchema.pre("save", async function (next) {
  if (!this.academicYear) {
    this.academicYear = await getActiveAcademicYear();
  }
  next();
});


attendanceSchema.index(
  {
    date: 1,
    academicYear: 1,
    classId: 1,
    sectionId: 1,
    type: 1,
  },
  { unique: true },
);

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
