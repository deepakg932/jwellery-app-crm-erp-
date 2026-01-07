import StockLedger from "../Models/models/StockLedger.js";
import mongoose from "mongoose";
export const getStockLedger = async (req, res) => {
  try {
    const { branch, item, reason } = req.query;
    console.log(req.query,"kkkkk")

    const filter = {};

    if (branch && mongoose.Types.ObjectId.isValid(branch)) {
      filter.branch = branch;
    }

    if (item && mongoose.Types.ObjectId.isValid(item)) {
      filter.item = item;
    }

    if (reason) {
      filter.reason = reason;
    }

    const data = await StockLedger.find(filter)
      .populate("item", "item_name")
      .populate("branch", "branch_name address")
      // .populate({
      //   path: 'branch_id',
      //   select: 'branch_name address'
      // })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

