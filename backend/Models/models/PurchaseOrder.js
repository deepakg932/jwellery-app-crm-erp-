


import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
  {
    po_number: {
      type: String,
      unique: true,
      default: function() {
        return `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suppliers",
      required: true
    },
    items: [{
      inventory_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
        required: true
      },
      quantity: {
        type: Number,
        default: null
      },
      weight: {
        type: Number,
        default: null
      },
      rate: {
        type: Number,
        required: true,
        min: 0
      },
      expected_date: {
        type: Date,
        required: true
      },
      unit_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit"
      },

        metal_type: {
        type: String 
      },
      stone_type: {
        type: String
      },
      material_type: {
        type: String 
      },



      metal_purities: [{
        type: String 
      }],
      stone_purities: [{
        type: String
      }],
      status: {
        type: String,
        enum: ["pending", "received", "partial", "cancelled"],
        default: "pending"
      },
      received_quantity: {
        type: Number,
        default: 0
      },
      received_weight: {
        type: Number,
        default: 0
      }
    }],
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "completed", "cancelled"],
      default: "draft"
    },
    notes: {
      type: String,
      default: ""
    },
    order_date: {
      type: Date,
      default: Date.now
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);