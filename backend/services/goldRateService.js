// 

import axios from "axios";
import GoldRate from "../models/GoldRate.js";

const KARAT_MULTIPLIER = {
  "24K": 1,
  "22K": 0.916,
  "18K": 0.75,
  "14K": 0.585,
};

export const fetchLiveGoldRate = async () => {
  const res = await axios.get("https://www.goldapi.io/api/XAU/INR", {
    headers: {
      "x-access-token": process.env.GOLD_API_KEY,
    },
  });

  // 🔹 GoldAPI gives per ounce (24K)
  const ratePerOunce = res.data.price;

  // 🔹 Convert to per gram
  const ratePerGram24K = ratePerOunce / 31.1035;

  // 🔹 Convert to 10 gram base
  const ratePer10Gram24K = ratePerGram24K * 10;

  const records = [];

  for (const karat in KARAT_MULTIPLIER) {
    const karatRate10Gram =
      ratePer10Gram24K * KARAT_MULTIPLIER[karat];

    const record = await GoldRate.create({
      karat,
      rate_per_gram: Math.round(karatRate10Gram / 10),
      rate_per_10_gram: Math.round(karatRate10Gram),
      currency: "INR",
      source: "goldapi",
      fetched_at: new Date(),
    });

    records.push(record);
  }

  return records;
};
