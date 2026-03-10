import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  action: String,
  oldValue: String,
  newValue: String,
  performedBy: String, // Email or User ID
  timestamp: { type: Date, default: Date.now },
  metadata: Object,
});

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);
