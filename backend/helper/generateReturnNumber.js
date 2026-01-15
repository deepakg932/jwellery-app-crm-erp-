import Counter from "../Models/models/Counter.js";

export const generateReturnNumber = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { key: "sale_return", year },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `SR-${year}-${String(counter.value).padStart(5, "0")}`;
};
