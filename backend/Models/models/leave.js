import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    leave_days: {
      type: Number,
      required: true,
    },
    leave_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
    },

    duration_type: {
      type: String,

      default: "full_day",
    },

    from_date: {
      type: Date,
    },

    to_date: {
      type: Date,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    attachment: {
      type: String,
    },

    status: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("leave", leaveSchema);
