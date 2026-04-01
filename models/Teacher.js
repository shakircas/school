import {
  ACADEMIC_QUALIFICATIONS,
  KP_DESIGNATIONS,
  PROFESSIONAL_QUALIFICATIONS,
} from "@/lib/constants";
import mongoose from "mongoose";

const genders = ["Male", "Female", "Other"];

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },

    /* =====================
       GOVT IDENTIFIERS
       ===================== */

    nic: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Invalid NIC format"],
    },

    personalNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^[0-9]{8}$/, "Personal No must be 8 digits"],
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Pakistan" },
    },
    qualification: {
      type: String,
      enum: ACADEMIC_QUALIFICATIONS,
      required: true,
    },

    professionalQualification: [
      {
        type: String,
        enum: PROFESSIONAL_QUALIFICATIONS,
      },
    ],

    designation: {
      type: String,
      enum: KP_DESIGNATIONS,
      required: true,
    },

    // department: {
    //   type: String,
    //   enum: KP_DEPARTMENTS,
    //   required: true,
    // },

    specialization: {
      type: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },

    subjects: [
      {
        type: String,
      },
    ],
    assignedClasses: [
      {
        class: String,
        section: String,
        subject: String,
      },
    ],
    salary: {
      basic: Number,
      allowances: Number,
      deductions: Number,
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Resigned", "Terminated"],
      default: "Active",
    },
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
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  },
);

teacherSchema.index({ name: "text", personalNo: "text", email: "text" });
teacherSchema.index({ department: 1 });
teacherSchema.index({ status: 1 });

export default mongoose.models.Teacher ||
  mongoose.model("Teacher", teacherSchema);
