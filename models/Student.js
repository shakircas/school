import { getActiveAcademicYear } from "../lib/getAcademicYear.js";
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: String,
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    // =============================
    // RELATIONSHIP FIELDS (CRITICAL)
    // =============================

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sectionId: {
      type: String,
      required: true,
      index: true,
      default: "all",
    },

    academicYear: {
      type: String,
      index: true,
    },

    graduationYear: {
      type: String, // "2024-2025"
      index: true,
    },

    lastClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    // Legacy support (DO NOT USE IN NEW CODE)
    class: String,
    section: String,

    admissionDate: {
      type: Date,
      default: Date.now,
    },
    admissionClass: String,
    previousSchool: String,

    // =============================
    // FAMILY & GUARDIAN INFO
    // =============================

    fatherName: { type: String, required: true },
    fatherPhone: String,
    fatherOccupation: String,
    motherName: String,
    motherPhone: String,
    guardianName: String,
    guardianPhone: String,
    guardianRelation: String,

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Pakistan" },
    },

    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },

    medicalInfo: {
      allergies: String,
      conditions: String,
      medications: String,
    },

    transportRoute: String,

    // =============================
    // STATUS MANAGEMENT
    // =============================

    admissionStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Graduated",
        "Transferred",
        "Expelled",
        "Pending",
        "Withdrawn",
        "all",
      ],
      default: "Active",
      index: true,
    },
    withdrawalDate: Date,
    withdrawalReason: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // teacher
    },

    // =============================
    // MEDIA
    // =============================

    photo: {
      url: String,
      publicId: String,
    },
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },

  { timestamps: true },
);

studentSchema.pre("save", async function (next) {
  if (!this.academicYear) {
    this.academicYear = await getActiveAcademicYear();
  }
  next();
});

// =============================
// INDEXES (PERFORMANCE + SAFETY)
// =============================

studentSchema.index({ admissionDate: -1 });

// Unique per class + section
// Change this in your Student Model file
studentSchema.index(
  { rollNumber: 1, classId: 1, sectionId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "Active" }, // CRITICAL: Only active students count for uniqueness
  },
);
studentSchema.index({ registrationNumber: 1 }, { unique: true });

// Attendance & listing
studentSchema.index({ classId: 1, sectionId: 1, status: 1 });

// Search
studentSchema.index({
  name: "text",
  rollNumber: "text",
  registrationNumber: "text",
});

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
