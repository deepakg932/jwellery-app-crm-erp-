// helper/generateCustomOrderNumber.js
import CustomOrder from "../Models/models/CustomOrder.js";

export const generateCustomOrderNumber = async () => {
  const count = await CustomOrder.countDocuments();
  const next = String(count + 1).padStart(5, "0");
  const year = new Date().getFullYear();
  return `CO-${year}-${next}`;
};

