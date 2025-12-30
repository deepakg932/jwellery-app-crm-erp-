import mongoose from "mongoose";

const GRNSchema = new mongoose.Schema(
  {
    grn_number: {
      type: String,
      unique: true
    },

    po_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true
    },

    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suppliers",
      required: true
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },

    items: [{
      // Reference to PO item
      po_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrder.items"
      },

      inventory_item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
        required: true
      },

      // Ordered quantities (from PO for reference)
      ordered_quantity: Number,
      ordered_weight: Number,

      // Actually received
      received_quantity: Number,
      received_weight: Number,

      // Cost details
      unit_cost: Number,
      total_cost: Number,

      // Metal breakup for this specific receipt
      metals: [{
        metal_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Metal"
        },
        purity: String,  // 18K, 22K, 925, etc.
        weight: Number,
        cost: Number
      }],

      // Stone breakup for this specific receipt
      stones: [{
        stone_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StoneType"
        },
        quantity: Number,  // Number of stones
        weight: Number,    // In carats
        quality: String,   // VVS, VS, SI, etc.
        cost: Number
      }],

      remarks: String
    }],

    // Totals
    total_items: Number,
    total_cost: Number,

    // Status
    status: {
      type: String,
      enum: ["draft", "received", "verified", "cancelled"],
      default: "draft"
    },

    received_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    remarks: String,

    received_date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Auto-generate GRN number
GRNSchema.pre("save", async function() {
  if (!this.grn_number) {
    const count = await this.constructor.countDocuments();
    this.grn_number = `GRN-${(count + 1).toString().padStart(3, '0')}`;
  }
});

export default mongoose.model("GRN", GRNSchema);