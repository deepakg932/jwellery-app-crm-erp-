import LeaveType from "../models/LeaveType.js";
import mongoose from "mongoose";


export const calculateLeaveDays = (from_date, to_date, duration_type) => {
  if (duration_type === "first_half" || duration_type === "second_half") {
    return 0.5;
  }

  const from = new Date(from_date);
  const to = new Date(to_date);
  const diff = Math.abs(to - from);
  return diff / (1000 * 60 * 60 * 24) + 1;
};
