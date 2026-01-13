
import Role from "../Models/models/Role.js";


export const createRole = async (req, res) => {
  try {
    //  const { name, permissions = [], description } = req.body;

    const { role_name, description } = req.body;

    if (!role_name) {
      return res.status(400).json({success: false,message: "Role name is required",});
    }

    const existing = await Role.findOne({ role_name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Role already exists",});
    }

    const role = await Role.create({
      role_name,
    //   permissions,
      description,
    });

    return res.status(201).json({ success: true,message: "Role created successfully",data: role,});
  } catch (error) {
    console.error("Create Role Error:", error);
    return res.status(500).json({success: false,message: "Server error",});
  }
};


export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, description } = req.body;

    // 🔴 at least one field required
    if (!role_name && !description) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    // 🔁 check duplicate role name
    if (role_name) {
      const existing = await Role.findOne({
        role_name,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Role name already exists",
        });
      }
    }

    // ✅ update object
    const updateData = {};
    if (role_name) updateData.role_name = role_name;
    if (description !== undefined) updateData.description = description;

    const role = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    return res.json({success: true,count: roles.length,data: roles,});
  } catch (error) {
    console.error("Get Roles Error:", error);
    return res.status(500).json({ success: false,message: "Server error",});
  }
};


export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({ success: false,message: "Role not found",});
    }
    return res.json({ success: true,message: "Role deleted successfully",});
    } catch (error) {
    console.error("Delete Role Error:", error);
    return res.status(500).json({ success: false,message: "Server error",});

  }
};