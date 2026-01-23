
import mongoose from "mongoose";

const JobCardSchema = new mongoose.Schema(
  {
    job_card_no: { type: String, unique: true },

    quotation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      default: null,
    },
    quotation_number: String,

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    job_card_date: { type: Date, },
    expected_delivery_date: { type: Date},
    delivery_date: Date,

    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          // required: true,
        },
        product_code: String,
        product_name: String,
        description: String,
        quantity: Number,
        unit_price: Number,
        total_amount: Number,
        notes: String,
      },
    ],

// JobCard.js
stage: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "DesignStage",
  default: null,
},

    
    note: String,
    instructions: String,

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    images:{
      type: [String],
      default: [],
    },

  stage: {
  type: String,
  enum: [
    "not started",
    "design stage",
    "design in progress",
    "design completed"
  ],
  default: "not started",
},


status: {
  type: String,
  enum: [
    "pending",
    "approved",      // ✅ NEW
    "in_progress",
    "completed",
    "delivered",
    "cancelled"
  ],
  default: "pending",
},

    total_amount: Number,
    advance_amount: Number,
    balance_amount: Number,

    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  { timestamps: true }
);

export default mongoose.model("JobCard", JobCardSchema);

