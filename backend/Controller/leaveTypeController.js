import LeaveType from "../models/LeaveType.js";



export const createLeaveType = async (req, res) => {
  try {
    const {
      leave_type_name,
      leave_paid_status,
      leave_allotment_type,
      no_of_leaves,
      monthly_limit,
    } = req.body;
    console.log("Creating Leave Type:", req.body);

  
    if (!leave_type_name) {
      return res.status(400).json({success: false,message:"Leave type name is required" });
    }

    const exists = await LeaveType.findOne({ leave_type_name });
    console.log("Existing Leave Type Check:", exists)

    // if (exists) {
    //   return res.status(400).json({ success: false, message: "Leave type already exists"  });
    // }

    const leaveType = await LeaveType.create({
      leave_type_name,
      leave_paid_status,
      leave_allotment_type,
      no_of_leaves,
      monthly_limit,
    });
    console.log(leaveType,"jjjjj")

    return res.status(201).json({success: true,message: "Leave type created successfully",data: leaveType,});
  } catch (error) {
    console.error("Create Leave Type Error:", error);
    return res.status(500).json({success: false,message: "Failed to create leave type",});
  }
};


export const getLeaveTypes = async (req, res) => {
  try {
    const data = await LeaveType.find().sort({ createdAt: -1 });
    console.log(data,"data")

   return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({success: false,message: "Failed to fetch leave types",});
  }
};



export const updateLeaveType = async (req, res) => {
  try {
    const updated = await LeaveType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    console.log("updated", updated)

    return res.json({success: true,message: "Leave type updated",data: updated,});
  } catch (error) {
    return res.status(500).json({success: false,message: "Update failed",error: error.message});
  }
};


export const deleteLeaveType = async (req, res) => {
  try {
    await LeaveType.findByIdAndDelete(req.params.id);

   return res.json({success: true,message: "Leave type deleted",});
  } catch (error) {
    return res.status(500).json({success: false,message: "Delete failed",error: error.message});
  }
};