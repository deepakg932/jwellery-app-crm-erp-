
export const MetalType = ['gold', 'silver', 'platinum'];
export const StockMovementType = ['in', 'out', 'transfer', 'melting', 'damage'];
export const ProductStatus = ['in-stock', 'sold', 'repair', 'manufacturing'];
export const ChargeType = ['pergram', 'fixed'];
export const JobType = ['order', 'stock'];
export const JobStage = ['cad', 'casting', 'filing', 'setting', 'polishing', 'qc'];
export const PaymentMode = ['cash', 'upi', 'card'];
export const AccountType = ['asset', 'liability', 'income', 'expense'];
export const VoucherType = ['receipt', 'payment', 'journal'];
export const LoyaltyType = ['add', 'use'];


export const StoneType = ['diamond', 'emerald', 'ruby', 'cz', 'moissanite', 'none'];

export const stringReq = { type: String, required: true, trim: true };
export const numberReq = { type: Number, required: true };
export const decimal2 = { type: Number, min: 0 };
export const decimal3 = { type: Number, min: 0 };
