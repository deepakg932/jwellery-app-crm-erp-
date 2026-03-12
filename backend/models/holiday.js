import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    occasion: {
      type: String,
      required: true,
      trim: true,
    },

    occasion_date: {
      type: Date,
      required: true,
    },

    // 👇 multi department
    department_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    designation_id: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    }
    ],

   employment_types: [
  {
    value: {
      type: String,
    },
   
  },
],

    description: {
      type: String,
      default: "",
    },
    status:
    {
        type:String,
        default: "active",

    }

    // is_recurring: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Holiday", holidaySchema);