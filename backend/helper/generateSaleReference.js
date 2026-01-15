import Counter from "../Models/models/Counter.js";

export const generateSaleReference = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { key: "sale_reference", year },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `REF-${year}-${String(counter.value).padStart(5, "0")}`;
};
