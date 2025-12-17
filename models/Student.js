// import mongoose from "mongoose"

// const studentSchema = new mongoose.Schema(
//   {
//     rollNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     registrationNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//     },
//     phone: {
//       type: String,
//     },
//     dateOfBirth: {
//       type: Date,
//       required: true,
//     },
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       required: true,
//     },
//     bloodGroup: {
//       type: String,
//       enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
//     },
//     address: {
//       street: String,
//       city: String,
//       state: String,
//       zipCode: String,
//       country: { type: String, default: "Pakistan" },
//     },
//     fatherName: {
//       type: String,
//       required: true,
//     },
//     fatherPhone: {
//       type: String,
//     },
//     fatherOccupation: {
//       type: String,
//     },
//     motherName: {
//       type: String,
//     },
//     motherPhone: {
//       type: String,
//     },
//     guardianName: {
//       type: String,
//     },
//     guardianPhone: {
//       type: String,
//     },
//     guardianRelation: {
//       type: String,
//     },
//     class: {
//       type: String,
//       required: true,
//     },
//     section: {
//       type: String,
//       required: true,
//     },
//     admissionDate: {
//       type: Date,
//       default: Date.now,
//     },
//     admissionClass: {
//       type: String,
//     },
//     previousSchool: {
//       type: String,
//     },

//     // ADMISSIONS STATUS
//     admissionStatus: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//     status: {
//       type: String,
//       enum: ["Active", "Inactive", "Graduated", "Transferred", "Expelled","Pending"],
//       default: "Active",
//     },
//     withdrawalDate: {
//       type: Date,
//     },
//     withdrawalReason: {
//       type: String,
//     },
//     photo: {
//       url: String,
//       publicId: String,
//     },
//     documents: [
//       {
//         name: String,
//         url: String,
//         publicId: String,
//         uploadedAt: { type: Date, default: Date.now },
//       },
//     ],
//     emergencyContact: {
//       name: String,
//       relation: String,
//       phone: String,
//     },
//     medicalInfo: {
//       allergies: String,
//       conditions: String,
//       medications: String,
//     },
//     transportRoute: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// studentSchema.index({ name: "text", rollNumber: "text", registrationNumber: "text" })
// studentSchema.index({ class: 1, section: 1 })
// studentSchema.index({ status: 1 })

// export default mongoose.models.Student || mongoose.model("Student", studentSchema)

// =============================
// HARDENED STUDENT MODEL (Schema-safe, Attendance & Timetable ready)
// =============================

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
      enum: ["pending", "approved", "rejected"],
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
      ],
      default: "Active",
      index: true,
    },
    withdrawalDate: Date,
    withdrawalReason: String,

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
  { timestamps: true }
);

// =============================
// INDEXES (PERFORMANCE + SAFETY)
// =============================

studentSchema.index({ admissionDate: -1 });

// Unique per class + section
studentSchema.index(
  { rollNumber: 1, classId: 1, sectionId: 1 },
  { unique: true }
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
