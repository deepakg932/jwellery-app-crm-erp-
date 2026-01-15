// helper/generateArticleNo.js
import Counter from "../Models/models/Counter.js";

export const generateArticleNo = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { key: "article_no", year },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `ART-${year}-${String(counter.value).padStart(5, "0")}`;
};
