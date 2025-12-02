
import mongoose from 'mongoose';
const StockTransferItemSchema = new mongoose.Schema(
  {
    transfer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StockTransfer', required: true, index: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  },
  { timestamps: true }
);
StockTransferItemSchema.index({ transfer_id: 1, product_id: 1 }, { unique: true });
export default mongoose.model('StockTransferItem', StockTransferItemSchema);
