const saleSchema = new mongoose.Schema({
  invoiceNo: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    grossWeight: Number,
    netWeight: Number,
    makingCharge: Number,
    gstAmount: Number,
    totalAmount: Number
  }],

  subtotal: Number,
  discount: Number,
  gstTotal: Number,
  grandTotal: Number,

  paymentStatus: {
    type: String,
    enum: ["PAID", "PARTIAL", "UNPAID"]
  }
}, { timestamps: true });

export default mongoose.model("Sale", saleSchema);
