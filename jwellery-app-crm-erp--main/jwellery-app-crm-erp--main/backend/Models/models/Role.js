import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    permissions: [{ type: String }], // simple permission strings e.g. "products:create"
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
