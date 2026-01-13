// import PurchaseOrder from "../Models/models/PurchaseOrder.js";

// const updatePOReceivedAfterReturn = async (poId, returnItems) => {
//   const po = await PurchaseOrder.findById(poId);
//   if (!po) return;

//   po.items.forEach(poItem => {
//     const returnedItem = returnItems.find(
//       r => r.inventory_item_id.toString() === poItem.inventory_item_id.toString()
//     );

//     if (returnedItem) {
//       poItem.received_quantity = Math.max(
//         0,
//         (poItem.received_quantity || 0) - (returnedItem.return_quantity || 0)
//       );

//       poItem.received_weight = Math.max(
//         0,
//         (poItem.received_weight || 0) - (returnedItem.return_weight || 0)
//       );
//     }
//   });

//   await po.save();
// };

// export default updatePOReceivedAfterReturn;


import PurchaseOrder from "../Models/models/PurchaseOrder.js";

const updatePOReceivedAfterReturn = async (poId, returnItems) => {
  const po = await PurchaseOrder.findById(poId);
  if (!po) return;

  for (const retItem of returnItems) {
    const poItem = po.items.find(
      i =>
        i.inventory_item_id.toString() ===
        retItem.inventory_item_id.toString()
    );

    if (!poItem) continue;

    poItem.received_quantity =
      Math.max(
        0,
        (poItem.received_quantity || 0) -
          Number(retItem.return_quantity || 0)
      );

    poItem.received_weight =
      Math.max(
        0,
        (poItem.received_weight || 0) -
          Number(retItem.return_weight || 0)
      );
  }

  await po.save();
};

export default updatePOReceivedAfterReturn;

