import mongoose from 'mongoose';

const JobCardItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  article_no: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  notes: { type: String, trim: true, default: '' },
}, { _id: false });

const JobCardSchema = new mongoose.Schema(
  {
    job_card_no: { type: String, required: true, unique: true },
    job_card_date: { type: Date, default: Date.now },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    quotation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    quotation_number: { type: String, trim: true },
    type: { type: String, enum: ['custom_order', 'design', 'sample', 'making', 'repair', 'other', 'order', 'stock'], default: 'custom_order' },
    job_no_manual: { type: String, trim: true },
    karigar_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Karigar' },
    karigar_name: { type: String, trim: true },
    job_type: { type: String, trim: true },
    estimated_cost: { type: Number, default: 0 },
    gross_weight: { type: Number, default: 0 },
    expected_delivery_date: { type: Date },
    start_date: { type: Date },
    due_date: { type: Date },
    delivery_date: { type: Date },
    status: { type: String, enum: ['open', 'in-progress', 'pending', 'completed', 'cancelled', 'on-hold'], default: 'pending', index: true },
    stage: { type: String, enum: ['design', 'cad', 'casting', 'filing', 'setting', 'polishing', 'plating', 'quality', 'packaging'], default: 'design' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    advance_paid: { type: Number, default: 0 },
    advance_amount: { type: Number, default: 0 },
    balance_amount: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    note: { type: String, trim: true },
    instructions: { type: String, trim: true },
    items: [JobCardItemSchema],
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    product_code: { type: String, trim: true },
    product_name: { type: String, trim: true },
    unit_price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    images: [{ type: String }],
    converted_to_sale: { type: Boolean, default: false },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

JobCardSchema.index({ customer_id: 1 });
JobCardSchema.index({ quotation_id: 1 });
JobCardSchema.index({ status: 1 });
JobCardSchema.index({ stage: 1 });

export default mongoose.model('JobCard', JobCardSchema);
