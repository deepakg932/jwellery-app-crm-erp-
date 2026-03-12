
import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    role_name: {
      type: String,
      unique: true,
    },
    // permissions: [{ type: String }],
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
