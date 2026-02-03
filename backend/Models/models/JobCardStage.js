// import mongoose from "mongoose"

// const JobCardStageSchema = new mongoose.Schema(
//   {
//     job_card_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "JobCard",
//       required: true,
//     },

//     department: {
//       type: String,
//       // enum: ["DESIGN", "CAD", "CASTING", "FILING", "ASSEMBLY"],
//       // // enum: ["DESIGN", "CAD", "CASTING", "ASSEMBLY"],
//       required: true,
//     },

//     assigned_to: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       default: null,
//     },

//     status: {
//       type: String,
//       enum: [
//         "draft",
//         "pending",
//         "in_progress",
//         "material_preparation",
//         "mold_making",
//         "burnout",
//         "casting",
//         "cooling",
//         "devesting",
//         "quality_check",
//         "finalized",
//         "approved",
//         "completed",
//         "hold",
//         "cancelled",
//         "rework",
//       ],
//       default: "draft",
//     },

//     start_date: Date,
//     end_date: Date,
//     completed_at: Date,

//     data: {

//       material_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
//       material_type: String,
//       material_item_code: String,
//       purity: String,

//       material_unit: String,
//       material_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },

//       material_issued_qty: Number,
//       material_used_qty: Number,
//       material_returned_qty: Number,
//       material_wastage_qty: Number,
//       material_wastage_type: String,

//       /* ===== CASTING PROCESS ===== */
//       casting_method: String,
//       mold_type: String,
//       tree_size: Number,
//       burnout_time: Number,
//       casting_temperature: Number,
//       pressure_applied: Number,
//       vacuum_level: Number,

//       /* ===== QUALITY ===== */
//       surface_quality: String,
//       dimensional_accuracy: String,
//       porosity_level: String,
//       defects: String,
//       rework_required: Boolean,
//       rework_reason: String,

//       /* ===== TIME ===== */
//       preparation_time: Number,
//       mold_making_time: Number,
//       burnout_time_track: Number,
//       casting_time: Number,
//       finishing_time: Number,
//       quality_check_time: Number,
//       labour_hours: Number,
//       actual_hours: Number,
//       total_time_spent: Number,
//       time_breakdown: String,

//       /* ===== COST ===== */
//       material_cost: Number,
//       labour_cost: Number,
//       equipment_cost: Number,
//       consumables_cost: Number,
//       gas_cost: Number,
//       other_costs: Number,
//       total_cost: Number,
//       markup_percentage: Number,
//       final_price: Number,
//       cost_currency: { type: String, default: "INR" },
//       cost_status: {
//         type: String,
//         enum: ["estimated", "calculated", "finalized", "approved"],
//         default: "estimated",
//       },

//       /* ===== FILE META ===== */
//       file_version: { type: String, default: "1.0" },
//       file_revisions: { type: Number, default: 0 },
//       file_status: {
//         type: String,
//         enum: [
//           "draft",
//           "work_in_progress",
//           "under_review",
//           "revised",
//           "final",
//           "archived",
//         ],
//         default: "draft",
//       },
//       backup_location: String,

//       files: [
//         {
//           name: String,
//           size: Number,
//           type: String,
//           url: String,
//           category: { type: String, enum: ["source", "output"], default: "output" },
//           version: String,
//           revision: Number,
//           uploaded_at: Date,
//         },
//       ],
//     },

//     remarks: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.model("JobCardStage", JobCardStageSchema);

import mongoose from "mongoose";

const JobCardStageSchema = new mongoose.Schema(
  {
    job_card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true,
    },

    department: {
      type: String,
      required: true, // DESIGN | CAD | CASTING | FILING | etc
    },

    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "in_progress",
        "material_preparation",
        "mold_making",
        "burnout",
        "casting",
        "cooling",
        "devesting",
        "quality_check",
        "finalized",
        "approved",
        "completed",
        "hold",
        "cancelled",
        "rework",
      ],
      default: "draft",
    },

    start_date: Date,
    end_date: Date,
    completed_at: Date,

    data: {
      material_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
      },
      material_type: String,
      material_item_code: String,
      purity: String,

      material_unit: String,
      material_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },

      material_issued_qty: Number,
      material_used_qty: Number,
      material_returned_qty: Number,
      material_wastage_qty: Number,
      material_wastage_type: String,

      casting_method: String,
      mold_type: String,
      tree_size: Number,
      burnout_time: Number,
      casting_temperature: Number,
      pressure_applied: Number,
      vacuum_level: Number,

      surface_quality: String,
      dimensional_accuracy: String,
      porosity_level: String,
      defects: String,

      tool_cost: Number,

      tool_wastage: Number,
      tool_wastage_type: {
        type: String,
        enum: ["normal", "high", "excessive", "recovered"],
      },

      filing_type: {
        type: String,
        enum: ["manual", "machine", "cnc", "laser"],
      },

      surface_finish: {
        type: String,
        enum: ["rough", "smooth", "very_smooth", "mirror"],
      },

      roughness_level: {
        type: String,
        enum: ["coarse", "medium", "fine", "very_fine"],
      },

      tolerance_level: {
        type: String,
        enum: ["rough", "standard", "fine", "precision"],
      },

      defects_removed: String,

      rework_required: Boolean,
      rework_reason: String,

      preparation_time: Number,
      rough_filing_time: Number,
      fine_filing_time: Number,
      polishing_time: Number,
      quality_check_time: Number,

      labour_hours: Number,
      actual_hours: Number,
      total_time_spent: Number,
      time_breakdown: String,

      material_cost: Number,
      labour_cost: Number,
      equipment_cost: Number,
      consumables_cost: Number,
      wastage_cost: Number,
      other_costs: Number,
      total_cost: Number,

      markup_percentage: Number,
      final_price: Number,

      cost_currency: { type: String, default: "INR" },
      cost_status: {
        type: String,
        enum: ["estimated", "calculated", "finalized", "approved"],
        default: "estimated",
      },

      /* ===================== 💎 STONE SETTING STAGE (NEW – ADDED) ===================== */
      // stone info
      stone_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
      stone_type: String,
      stone_name: String,
      stone_item_code: String,

      stone_quantity: Number,
      stone_carat: Number,
      stone_cost: Number,
      stone_cost_total: Number,

      stone_breakage: Number,
      stone_breakage_reason: String,

      // setting process
      setting_type: {
        type: String,
        enum: [
          "prong",
          "bezel",
          "pave",
          "channel",
          "flush",
          "tension",
          "invisible",
        ],
      },

      setting_method: {
        type: String,
        enum: ["manual", "semi_auto", "laser", "pressure"],
      },

      tool_used: String,

      precision_level: {
        type: String,
        enum: ["ultra_high", "high", "medium", "standard"],
      },

      stone_secure: Boolean,

      prong_count: Number,
      bezel_thickness: Number,

      // time
      setting_time: Number,

      /* ===================== ✨ POLISHING STAGE (NEW – ADDED) ===================== */
      // polishing material
      material_used: String,
      material_quantity: Number,
      material_unit: String,

      // polishing process
      polish_type: {
        type: String,
        enum: ["rough", "fine", "final", "buff"],
      },

      polish_grade: String,

      polishing_method: {
        type: String,
        enum: ["manual", "machine", "tumble", "vibratory", "electro"],
      },

      equipment_used: String,
      rpm_speed: Number,
      pressure_applied: Number,

      // surface & quality
      brightness_level: {
        type: String,
        enum: ["low", "medium", "high", "very_high", "excellent"],
      },

      scratch_removal: {
        type: String,
        enum: ["none", "partial", "most", "complete"],
      },

      surface_consistency: {
        type: String,
        enum: ["poor", "average", "good", "excellent", "perfect"],
      },

      defects_noted: String,

      // time (polishing specific)
      inspection_time: Number,

      material_name: String,
      material_code: String,
      material_used_qty: Number,
      material_unit: String,

      // plating process
      plating_type: {
        type: String,
        enum: ["electroplating", "electroless", "immersion", "brush"],
      },

      plating_thickness: Number,
      current_density: Number,
      voltage_applied: Number,
      plating_time: Number,

      bath_temperature: Number,
      ph_level: Number,

      // quality
      surface_finish: {
        type: String,
        enum: ["excellent", "good", "average", "poor"],
        default: "good",
      },

      adhesion_quality: {
        type: String,
        enum: ["excellent", "good", "average", "poor"],
        default: "good",
      },

      uniformity: {
        type: String,
        enum: ["excellent", "good", "average", "poor"],
        default: "good",
      },

      defects: String,

      rework_required: {
        type: Boolean,
        default: false,
      },
      rework_reason: String,

      // time tracking
      preparation_time: Number,
      cleaning_time: Number,
      plating_time_track: Number,
      rinsing_time: Number,
      drying_time: Number,
      quality_check_time: Number,

      // cost breakup
      material_cost: Number,
      labour_cost: Number,
      equipment_cost: Number,
      chemical_cost: Number,
      electricity_cost: Number,
      other_costs: Number,
      total_cost: Number,

      markup_percentage: Number,
      final_price: Number,

      /* ===================== 🔍 QUALITY CHECK STAGE ===================== */
      // basic quality
      /* ===================== ✅ QUALITY CHECK STAGE ===================== */

      // basic quality
      // check_points: [String], // dimensions, weight, purity, finish etc
      overall_status: {
        type: String,
        enum: ["pending", "passed", "failed", "rework", "hold"],
        default: "pending",
      },

      // dimensions
      dimensions_check: Boolean,
      dimensions_tolerance: {
        type: String,
        enum: ["within_spec", "slight_deviation", "out_of_spec", "na"],
      },
      dimensions_notes: String,

      // weight
      weight_check: Boolean,
      weight_tolerance: {
        type: String,
        enum: ["within_spec", "slight_deviation", "out_of_spec", "na"],
      },
      weight_notes: String,

      // purity
      purity_check: Boolean,
      purity_verified: String,
      purity_certificate_no: String,

      // finish
      finish_check: Boolean,
      finish_quality: {
        type: String,
        enum: ["excellent", "good", "average", "poor"],
      },
      finish_defects: String,

      // defects tracking
      defects_detected: [String],
      defects_count: Number,
      critical_defects: Number,
      major_defects: Number,
      minor_defects: Number,

      // inspection
      inspection_method: {
        type: String,
        enum: [
          "visual",
          "dimensional",
          "weight",
          "purity",
          "functional",
          "sample",
          "destructive",
        ],
      },
      // measuring_tools_used: [String],
      sample_size: Number,
      batch_size: Number,
      accepted_quantity: Number,
      rejected_quantity: Number,

      // approval & rework
      rework_required: Boolean,
      rework_reason: String,
      approved_by: String,
      approval_date: Date,
      certificate_issued: Boolean,
      certificate_number: String,

      // cost
      inspection_cost: Number,
      labour_cost: Number,
      equipment_cost: Number,
      certification_cost: Number,
      other_costs: Number,
      total_cost: Number,

      // time
      preparation_time: Number,
      inspection_time: Number,
      documentation_time: Number,
      approval_time: Number,
      total_time_spent: Number,
      time_breakdown: String,










      /* ===================== 📦 PACKAGING STAGE ===================== */

// // materials used
// materials_used: [String],

box_used: { type: Boolean, default: false },
box_type: { type: String, default: "standard" },
box_quantity: { type: Number, default: 1 },
box_cost: { type: Number, default: 0 },

certificate_used: { type: Boolean, default: false },
certificate_type: { type: String, default: "standard" },
certificate_quantity: { type: Number, default: 1 },
certificate_cost: { type: Number, default: 0 },

cotton_used: { type: Boolean, default: false },
cotton_quantity: { type: Number, default: 0 },
cotton_cost: { type: Number, default: 0 },

// additional_materials: [
//   {
//     name: String,
//     quantity: Number,
//     unit: {
//       type: String,
//       enum: ["pieces", "grams", "meters", "sheets"],
//       default: "pieces",
//     },
//     cost: Number,
//   },
// ],

// quality check
quality_check: { type: Boolean, default: false },
quality_score: { type: Number, default: 100 },
quality_remarks: String,

// cost tracking
material_cost: { type: Number, default: 0 },
labour_cost: { type: Number, default: 0 },
equipment_cost: { type: Number, default: 0 },
other_costs: { type: Number, default: 0 },
total_cost: { type: Number, default: 0 },

markup_percentage: { type: Number, default: 15 },
final_price: { type: Number, default: 0 },

cost_currency: { type: String, default: "INR" },
cost_status: {
  type: String,
  enum: ["estimated", "calculated", "finalized", "approved"],
  default: "estimated",
},

// time tracking
preparation_time: { type: Number, default: 0 },
packaging_time: { type: Number, default: 0 },
labeling_time: { type: Number, default: 0 },
quality_time: { type: Number, default: 0 },
documentation_time: { type: Number, default: 0 },
total_time_spent: { type: Number, default: 0 },
time_breakdown: String,

// packaging process
packaging_type: {
  type: String,
  enum: ["standard", "premium", "gift", "eco_friendly", "luxury"],
  default: "standard",
},

sealing_method: {
  type: String,
  enum: ["sticker", "tape", "seal", "ribbon", "shrink_wrap"],
  default: "sticker",
},

weight_after_packaging: Number,

barcode_generated: { type: Boolean, default: false },
barcode_number: String,

// invoice_generated: { type: Boolean, default: false },
invoice_number: String,


      // helper
      next_stage: String,

      file_version: { type: String, default: "1.0" },
      file_revisions: { type: Number, default: 0 },
      file_status: {
        type: String,
        enum: [
          "draft",
          "work_in_progress",
          "under_review",
          "revised",
          "final",
          "archived",
        ],
        default: "draft",
      },
      backup_location: String,

      files: [
        {
          name: String,
          size: Number,
          type: String,
          url: String,
          category: {
            type: String,
            enum: ["source", "output"],
            default: "output",
          },
          version: String,
          revision: Number,
          uploaded_at: Date,
        },
      ],
    },

    remarks: String,
  },
  { timestamps: true },
);

export default mongoose.model("JobCardStage", JobCardStageSchema);
