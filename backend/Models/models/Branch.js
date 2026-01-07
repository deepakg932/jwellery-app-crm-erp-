
import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
  branch_name: { type: String, trim: true },
  branch_code: { type: String, unique: true },

  branch_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BranchType", 
    required: true
  },
  contact_person: { type: String },
  is_warehouse: { type: Boolean, default: false },

  address: String,
  phone: String,
  status: { type: Boolean, default: true },
  gstno: String
}, { timestamps: true });
// BranchSchema.pre("save", function () {
//   if (!this.branch_code) {
//     this.branch_code = "BR" + Date.now().toString().slice(-4);
//   }
// });


BranchSchema.pre("save", function () {
  if (!this.branch_code) {
    // City निकालो (address से या branch_name से)
    let city = "";

    if (this.address) {
      // address से पहला word लो
      city = this.address.split(" ")[this.address.split(" ").length - 1]; 
      // Example: "Indore"
    } else if (this.branch_name) {
      city = this.branch_name.split(" ")[0]; 
    }

    // City को 3 letters में convert करो
    const prefix = city.substring(0, 3).toUpperCase();

    // Timestamp या counter जोड़ो ताकि unique बने
    this.branch_code = prefix + Date.now().toString().slice(-4);
  }
});





export default mongoose.model("Branch", BranchSchema);
