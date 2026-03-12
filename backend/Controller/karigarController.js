import Karigar from "../models/Karigar";
import Employee from "../Models/models/Employee.js";

export const createKarigar = async (req, res) => {
  try {
    const { employee_id, name, mobile, skills, labour_type, labour_rate, address, notes } = req.body;
    const karigar = new Karigar({
      employee_id,
      name,
        mobile,
        skills,
        labour_type,
        labour_rate,
        address,
        notes,
    });
    await karigar.save();
    res.status(201).json({ message: "Karigar created successfully", karigar });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};