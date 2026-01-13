import Employee from "../Models/models/EmployeeModel.js"
import Role from "../Models/models/Role.js";
import fs from "fs";
import path from "path";

export const createEmployee = async (req, res) => {
  try {
    const data = req.body;

    if (
        !data.pan_number ||
        !data.aadhaar_number ||
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.address ||
      !data.city ||
      !data.state ||
      !data.country ||
      !data.pincode ||
      !data.role_id ||
      !data.basic_salary
    ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All required fields must be filled",
    //   });
    }

  
    // const exists = await Employee.findOne({
    //   $or: [{ email: data.email }, { phone: data.phone }],
    // });

    // if (exists) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Employee with same email or phone already exists",
    //   });
    // }

   
    const role = await Role.findById(data.role_id);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }


       const imagePath = req.file
      ? `/uploads/employees/${req.file.filename}`
      : null;

    const employee = await Employee.create({
        pan_number: data.pan_number,
        aadhaar_number: data.aadhaar_number,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      role_id: data.role_id,
      basic_salary: data.basic_salary,
       image: imagePath, // 🔥 saved
      status: data.status || "active",
      created_by: req.user?._id || null,
    });

   
    const populatedEmployee = await Employee.findById(employee._id)
      .populate("role_id", "role_name description");

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getEmployees = async (req, res) => {
  try {
    const data = await Employee.find().populate('role_id', 'role_name description');
    return res.status(200).json({status: true,message:"Employees fetched successfully", data})
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};





export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 🔁 EMAIL / PHONE DUPLICATE CHECK (excluding self)
    const exists = await Employee.findOne({
      _id: { $ne: id },
      $or: [{ email: data.email }, { phone: data.phone }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already used by another employee",
      });
    }

    // 🔍 ROLE CHECK
    if (data.role_id) {
      const role = await Role.findById(data.role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Invalid role selected",
        });
      }
    }

    // 🖼 IMAGE UPDATE
    let imagePath = employee.image;

    if (req.file) {
      // delete old image
      if (employee.image) {
        const oldPath = path.join(process.cwd(), employee.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      imagePath = `/uploads/employees/${req.file.filename}`;
    }

    // 🔥 UPDATE FIELDS
    employee.pan_number = data.pan_number || employee.pan_number;
    employee.aadhaar_number = data.aadhaar_number || employee.aadhaar_number;
    employee.name = data.name || employee.name;
    employee.email = data.email || employee.email;
    employee.phone = data.phone || employee.phone;
    employee.address = data.address || employee.address;
    employee.city = data.city || employee.city;
    employee.state = data.state || employee.state;
    employee.country = data.country || employee.country;
    employee.pincode = data.pincode || employee.pincode;
    employee.role_id = data.role_id || employee.role_id;
    employee.basic_salary = data.basic_salary || employee.basic_salary;
    employee.image = imagePath;
    employee.status = data.status || employee.status;

    await employee.save();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate("role_id", "role_name description");

    return res.json({
      success: true,
      message: "Employee updated successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 🖼 DELETE IMAGE
    if (employee.image) {
      const imgPath = path.join(process.cwd(), employee.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Employee.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};