import Sale from "../Models/models/Sales.js"
import Item from "../models/Item.js";
import { addStockLedger } from "../services/stockLedger.service.js"
import Ledger from "../Models/models/Ledger.js";

export const createSale = async (req, res) => {
  try {
    const { customer, branch, items, discount = 0 } = req.body;

    let subtotal = 0;
    let gstTotal = 0;

   
    items.forEach(i => {
      subtotal += i.totalAmount;
      gstTotal += i.gstAmount;
    });

    const grandTotal = subtotal + gstTotal - discount;

    // 🔹 Create Sale
    const sale = await Sale.create({
      invoiceNo: "INV-" + Date.now(),
      customer,
      branch,
      items,
      subtotal,
      discount,
      gstTotal,
      grandTotal,
      paymentStatus: "UNPAID"
    });

    // 🔹 Stock OUT + Ledger entry
    for (const i of items) {
      await addStockLedger({
        item: i.item,
        branch,
        transactionType: "OUT",
        reason: "SALE",
        quantity: 1,
        grossWeight: i.grossWeight,
        netWeight: i.netWeight,
        referenceId: sale._id,
        createdBy: req.user._id
      });
    }

    // 🔹 Customer Ledger (Debit)
    await Ledger.create({
      partyType: "CUSTOMER",
      partyId: customer,
      debit: grandTotal,
      credit: 0,
      balance: grandTotal,
      referenceId: sale._id
    });

    res.status(201).json({ success: true, sale });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
