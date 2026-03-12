import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    leave_type_name: {
      type: String,
      
    //   trim: true,
    //   unique: true,
    },

    leave_paid_status: {
      type: String,
   
      default: "Paid",
    },

    leave_allotment_type: {
      type: String,
     
     
    },
    no_of_leaves: {
      type: Number,
   
      min: 0,
    },

    monthly_limit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);