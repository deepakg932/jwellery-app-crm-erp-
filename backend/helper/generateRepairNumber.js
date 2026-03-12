// helper/generateRepairNumber.js
import Repair from "../models/Repair.js";

export const generateRepairNumber = async () => {
  const year = new Date().getFullYear();

  // last repair of current year
  const lastRepair = await Repair.findOne({
    repair_number: { $regex: `^RP-${year}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastRepair && lastRepair.repair_number) {
    const lastSeq = lastRepair.repair_number.split("-").pop();
    nextNumber = parseInt(lastSeq, 10) + 1;
  }

  return `RP-${year}-${String(nextNumber).padStart(5, "0")}`;
};
