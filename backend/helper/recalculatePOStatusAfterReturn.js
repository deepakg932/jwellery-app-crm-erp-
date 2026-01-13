import PurchaseOrder from "../Models/models/PurchaseOrder.js";

const recalculatePOStatus = async (poId) => {
  const po = await PurchaseOrder.findById(poId);
  if (!po) return;

  let totalReceivedQty = 0;
  let totalReceivedWeight = 0;

  po.items.forEach(item => {
    totalReceivedQty += item.received_quantity || 0;
    totalReceivedWeight += item.received_weight || 0;
  });

  // 🔥 FULL RETURN CASE
  if (totalReceivedQty === 0 && totalReceivedWeight === 0) {
    po.status = "returned";
  }
  // 🔁 PARTIAL
  else {
    let totalOrderedQty = 0;
    let totalOrderedWeight = 0;

    po.items.forEach(item => {
      totalOrderedQty += item.quantity || 0;
      totalOrderedWeight += item.weight || 0;
    });

    if (
      totalReceivedQty < totalOrderedQty ||
      totalReceivedWeight < totalOrderedWeight
    ) {
      po.status = "partially_received";
    } else {
      po.status = "received";
    }
  }

  await po.save();
};

export default recalculatePOStatus;
