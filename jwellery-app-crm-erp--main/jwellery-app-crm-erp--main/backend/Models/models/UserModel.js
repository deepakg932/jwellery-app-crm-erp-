import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    company_name: { type: String, required: true, trim: true },
    full_name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    is_active: { type: Boolean, default: true },
    last_login: { type: Date },
    // role: { type: String, enum: ["admin", "branch", "customer"], default: "customer" },
    refresh_tokens: [{ token: String, created_at: Date }],
  },
  { timestamps: true }
);

// userSchema.index({ email: 1, tenant_id: 1 });
// userSchema.index({ username: 1, tenant_id: 1 });

export default mongoose.model("User", userSchema);
