

// import GRN from "../Models/models/GRNModel.js"
// import PurchaseOrder from "../Models/models/PurchaseOrder.js"
// import { addStock } from "../services/stock.service.js";

// export const createGRN = async (req, res) => {
//   try {
//     const {
//       purchase_order_id,
//       branch,
//       supplier_id,
//       items,
//       notes,
//     } = req.body;

//     const po = await PurchaseOrder.findById(purchase_order_id);
//     if (!po) {
//       return res.status(404).json({ success: false, message: "PO not found" });
//     }

//     const grn = await GRN.create({
//       purchase_order_id,
//       branch,
//       supplier_id,
//       items,
//       notes,
//       created_by: req.user?._id || null,
//     });

//     // 🔥 STOCK UPDATE
//     for (const item of items) {
//       await addStock({
//         inventory_item_id: item.inventory_item_id,
//         branch,
//         quantity: item.received_quantity,
//         weight: item.received_weight,
//         rate: item.rate,
//         source: "GRN",
//         source_id: grn._id,
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "GRN created & stock updated",
//       data: grn,
//     });
//   } catch (err) {
//     console.error("GRN Error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
