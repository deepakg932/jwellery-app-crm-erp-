import Counter from "../Models/models/Counter.js";

export const generateSaleReturnReference = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { key: "sale_return_reference", year },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `RET-${year}-${String(counter.value).padStart(5, "0")}`;
};
