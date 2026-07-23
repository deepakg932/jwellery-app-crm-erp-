import leave from "../models/leave.js";

import LeaveType from "../models/LeaveType.js";
import mongoose from "mongoose";
import { calculateLeaveDays } from "../helper/calculateLeaveDays.js";


// export const applyLeave = async (req, res) => {
//   try {
//     const {
//       employee_id,
//       leave_type_id,
//       duration_type,
//       from_date,
//       to_date,
//       reason,
//       status,
//     } = req.body;

//     const attachment = req.file ? req.file.path : null;
//     console.log(attachment,"attachment")

//     const dd = await leave.create({
//       employee_id,
//       leave_type_id,
//       duration_type,
//       from_date,
//       to_date,
//       reason,
//       attachment,
//       status
//     });
   

//     return res.status(201).json({success: true,message: "Leave applied successfully",data: dd,  });
//   } catch (error) {
//     console.error("Apply leave error:", error);
//     return res.status(500).json({success: false,message: "Failed to apply leave"});
//   }
// };


export const getLeaves = async (req, res) => {
  try {
    const leaves = await leave.find()
      .populate("employee_id", "name email")
         .populate(
        "leave_type_id",
        "leave_type_name leave_paid_status no_of_leaves monthly_limit"
      ) // 👈 add here
      .sort({ createdAt: -1 });
      //  .populate("leave_type_id", "leave_type_name leave_paid_status") // ✅ correct
      // .populate("leave_type_id", "name description")
      
     

  return res.json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching leaves" });
  }
};


export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const leave = await leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};


export const deleteLeave = async (req, res) => {
  try {
    const check= await leave.findByIdAndDelete(req.params.id);
    console.log("Leave deleted:", check);
    if (!check) {
      return res.status(404).json({success: false,message:"Leave not found"});
    }
    return res.json({ success: true, message: "Leave deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete leave" });
  }
};





export const updateLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    let {
      employee_id,
      leave_type_id,
      duration_type,
      from_date,
      to_date,
      reason,
      status,
    } = req.body;

    console.log(req.body, "req body");


    const update = await leave.findById(leaveId);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

  
    if (req.file) {
      update.attachment = req.file.path;
    }

    
    if (employee_id) update.employee_id = employee_id;
    if (leave_type_id) update.leave_type_id = leave_type_id;
    if (duration_type) update.duration_type = duration_type;
    if (from_date) update.from_date = from_date;
    if (to_date) update.to_date = to_date;
    if (reason) update.reason = reason;
    if (status) update.status = status;

   
    const savedData = await update.save();

    return res.json({
      success: true,
      message: "Leave updated successfully",
      data: savedData,
    });

  } catch (error) {
    console.error("Update Leave Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update leave",
    });
  }
};

export const applyLeave = async (req, res) => {
  try {
    let {
      employee_id,
      leave_type_id,
      duration_type,
      from_date,
      to_date,
      reason,
      status,
    } = req.body;

    const attachment = req.file ? req.file.path : null;

    // =========================================================
    // 🔥 STEP 1: GLOBAL LEAVE BALANCE CHECK (All types)
    // =========================================================

    const allLeaveTypes = await LeaveType.find();

    let totalAllotted = 0;
    allLeaveTypes.forEach((lt) => {
      totalAllotted += lt.no_of_leaves;
    });

    const usedAllAgg = await leave.aggregate([
      {
        $match: {
          employee_id: new mongoose.Types.ObjectId(employee_id),
               status: { $in: ["approved", "pending"] }, // ✅ fixed
        },
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: "$leave_days" },
        },
      },
    ]);

    const totalUsedAll = usedAllAgg[0]?.totalUsed || 0;
    const remainingAll = totalAllotted - totalUsedAll;

    if (remainingAll <= 0) {
      return res.status(400).json({
        success: false,
        message: "You have no leave balance remaining",
      });
    }

    // =========================================================
    // 🔥 STEP 2: LEAVE TYPE BALANCE CHECK
    // =========================================================

    const leaveType = await LeaveType.findById(leave_type_id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    const totalLeaves = leaveType.no_of_leaves;

    const usedLeavesAgg = await leave.aggregate([
      {
        $match: {
          employee_id: new mongoose.Types.ObjectId(employee_id),
          leave_type_id: new mongoose.Types.ObjectId(leave_type_id),
          status: { $in: ["approved", "pending"] }, // 🔥 important
        },
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: "$leave_days" },
        },
      },
    ]);

    const usedLeaves = usedLeavesAgg[0]?.totalUsed || 0;
    const remaining = totalLeaves - usedLeaves;

    // ❌ block if no balance
    if (remaining <= 0) {
      return res.status(400).json({
        success: false,
        message: "No leave balance remaining for this leave type",
      });
    }

    // =========================================================
    // 🔥 STEP 3: REQUESTED DAYS CALCULATION
    // =========================================================

    const requestedDays = calculateLeaveDays(
      from_date,
      to_date || from_date,
      duration_type
    );

    if (requestedDays > remaining) {
      return res.status(400).json({
        success: false,
        message: `Only ${remaining} leave(s) remaining`,
      });
    }

    // =========================================================
    // 🔥 STEP 4: CREATE LEAVE
    // =========================================================

    const newLeave = await leave.create({
      employee_id,
      leave_type_id,
      duration_type,
      from_date,
      to_date,
      reason,
      attachment,
      status,
      leave_days: requestedDays,
    });

    return res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: newLeave,
    });

  } catch (error) {
    console.error("Apply leave error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply leave",
    });
  }
};