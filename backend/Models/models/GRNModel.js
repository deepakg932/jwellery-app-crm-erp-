


import mongoose from "mongoose";

const GRNSchema = new mongoose.Schema({
  grn_number: {
    type: String,
    unique: true,
    default: function() {
      return `GRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  },
  po_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder",
    // required: true
  },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Suppliers",
    // required: true
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    // required: true
  },
  items: [{
    po_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true
    },
    inventory_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      // required: true
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null
    },
    ordered_quantity: {
      type: Number,
      default: null
    },
    ordered_weight: {
      type: Number,
      default: null
    },
    quantity: {
      type: Number,
      default: null
    },
    weight: {
      type: Number,
      default: null
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    total_cost: {
      type: Number,
      required: true,
      min: 0
    },
    metal_type: {
    type: String,
    default: null
  },
  stone_type: {
    type: String,
    default: null
  },
  material_type: {
    type: String,
    default: null
  },
    // Store purity data from PO
    metal_purities: [{
      type: String  // Array of metal purity names like ["22k", "18k"]
    }],
    stone_purities: [{
      type: String  // Array of stone purity names like ["AAA", "AA"]
    }],
    remarks: {
      type: String,
    
    }
  }],
  total_items: {
    type: Number,
    required: true,
    min: 0
  },
  total_cost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["draft", "received", "verified", "rejected"],
    default: "received"
  },
  received_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  received_date: {
    type: Date,
    default: Date.now
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  verified_date: {
    type: Date
  },
  remarks: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("GRN", GRNSchema);