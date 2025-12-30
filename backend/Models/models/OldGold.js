const oldGoldSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  grossWeight: Number,
  purity: String,
  rate: Number,
  deduction: Number,
  finalAmount: Number,
  adjustedInSale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" }
}, { timestamps: true });

export default mongoose.model("OldGold", oldGoldSchema);
