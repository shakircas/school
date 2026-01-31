import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // optional (OAuth support)
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      default: "student",
    },

    // student-specific
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    rollNumber: String,
    class: String,

    parentOf: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    resetToken: String,
    resetTokenExpiry: Date,

    // teacher-specific
    subjects: [String],

    isActive: { type: Boolean, default: true },
  },

  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
