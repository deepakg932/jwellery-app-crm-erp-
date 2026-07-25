import StockIn from '../Models/models/StockIn.js';

export const getStockMovements = async (req, res) => {
  try {
    const stockIns = await StockIn.find()
      .populate('po_id', 'order_date')
      .populate('supplier_id', 'supplier_name company_name name phone email')
      .populate('branch_id', 'branch_name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: stockIns });
  } catch (err) {
    console.error('getStockMovements error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStockMovementById = async (req, res) => {
  try {
    const stockIn = await StockIn.findById(req.params.id)
      .populate('po_id')
      .populate('supplier_id', 'supplier_name company_name name phone email')
      .populate('branch_id', 'branch_name');
    if (!stockIn) return res.status(404).json({ success: false, message: 'Stock In not found' });
    res.json({ success: true, data: stockIn });
  } catch (err) {
    console.error('getStockMovementById error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStockMovement = async (req, res) => {
  try {
    const data = { ...req.body };

    // Ensure supplier_id is a valid ObjectId string
    if (data.supplier_id && typeof data.supplier_id === 'object') {
      data.supplier_id = data.supplier_id._id || data.supplier_id.id || null;
    }
    if (!data.supplier_id) delete data.supplier_id;

    if (data.branch_id && typeof data.branch_id === 'object') {
      data.branch_id = data.branch_id._id || data.branch_id.id || null;
    }
    if (!data.branch_id) delete data.branch_id;

    if (data.po_id && typeof data.po_id === 'object') {
      data.po_id = data.po_id._id || data.po_id.id || null;
    }
    if (!data.po_id) delete data.po_id;

    // Generate GRN number
    const count = await StockIn.countDocuments();
    data.grn_number = `GRN-${String(count + 1).padStart(5, '0')}`;

    if (!data.received_date) data.received_date = new Date();
    if (!data.status) data.status = 'received';

    const stockIn = await StockIn.create(data);
    res.status(201).json({ success: true, message: 'Stock In created successfully', data: stockIn });
  } catch (err) {
    console.error('createStockMovement error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStockMovement = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.supplier_id && typeof data.supplier_id === 'object') {
      data.supplier_id = data.supplier_id._id || data.supplier_id.id || null;
    }
    if (!data.supplier_id) delete data.supplier_id;

    if (data.branch_id && typeof data.branch_id === 'object') {
      data.branch_id = data.branch_id._id || data.branch_id.id || null;
    }
    if (!data.branch_id) delete data.branch_id;

    if (data.po_id && typeof data.po_id === 'object') {
      data.po_id = data.po_id._id || data.po_id.id || null;
    }
    if (!data.po_id) delete data.po_id;

    const stockIn = await StockIn.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!stockIn) return res.status(404).json({ success: false, message: 'Stock In not found' });
    res.json({ success: true, message: 'Stock In updated successfully', data: stockIn });
  } catch (err) {
    console.error('updateStockMovement error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStockMovement = async (req, res) => {
  try {
    const stockIn = await StockIn.findByIdAndDelete(req.params.id);
    if (!stockIn) return res.status(404).json({ success: false, message: 'Stock In not found' });
    res.json({ success: true, message: 'Stock In deleted successfully' });
  } catch (err) {
    console.error('deleteStockMovement error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
