// helper/generateQuotationNumber.js
import Quotation from "../Models/models/QuatationModel.js";

export const generateQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Quotation.countDocuments();
  return `QT-${year}-${String(count + 1).padStart(5, "0")}`;
};
