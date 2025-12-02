
import mongoose from 'mongoose';
const StockTransferSchema = new mongoose.Schema(
  {
    from_branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    to_branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    status: { type: String, enum: ['initiated', 'in-transit', 'received', 'cancelled'], default: 'initiated' },
  },
  { timestamps: true }
);
export default mongoose.model('StockTransfer', StockTransferSchema);
