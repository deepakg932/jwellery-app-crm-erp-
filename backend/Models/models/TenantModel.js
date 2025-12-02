import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, trim: true, unique: true },
    meta: { type: Object },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", tenantSchema);
