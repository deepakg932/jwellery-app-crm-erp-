import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Auto-generate code from name before saving
userSchema.pre("save", function (next) {
  if (!this.code && this.name) {
    this.code = this.name.substring(0, 2).toUpperCase();
  }
  next();
});

export default mongoose.model("Unit", userSchema);