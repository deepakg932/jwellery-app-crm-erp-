import Employee from "../Models/models/EmployeeModel.js";
import Role from "../Models/models/Role.js";
import fs from "fs";
import path from "path";

export const createEmployee = async (req, res) => {
  try {
    const data = req.body;
    const BASE_URL = process.env.APP_URL;

    // ✅ Required validation
    const requiredFields = [
      "name",
      "email",
      "phone",
      "designation_id",
      "department_id",
      "user_role",
      "joining_date",
      "gender"
    ];

    // for (let field of requiredFields) {
    //   if (!data[field]) {
    //     return res.status(400).json({
    //       success: false,
    //       message: `${field} is required`,
    //     });
    //   }
    // }

    // ✅ role check
    const role = await Role.findById(data.user_role);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    // ✅ duplicate email
    const emailExist = await Employee.findOne({ email: data.email });
    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const imagePath = req.file
      ? `/uploads/employees/${req.file.filename}`
      : null;

    const employee = await Employee.create({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      reporting_to: data.reporting_to,
      state: data.state,
      city: data.city,

      pan_number: data.pan_number,
      aadhaar_number: data.aadhaar_number,

      salutation: data.salutation,
      gender: data.gender,
      about: data.about,
      language: data.language,

      joining_date: new Date(data.joining_date),
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,

      department_id: data.department_id,
      designation_id: data.designation_id,
      designation_name: data.designation_name,

      user_role: data.user_role,
      // basic_salary: Number(data.basic_salary || 0),

      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,

      profile_picture: imagePath,
      status: data.status || "active",

      created_by: req.user?._id || null,
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate("user_role", "role_name")
      .populate("department_id", "department_name")
     .populate("designation_id", "designation_name")
  .populate("reporting_to", "name email");

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        ...populatedEmployee._doc,
        fullImageUrl: populatedEmployee.profile_picture
          ? `${BASE_URL}${populatedEmployee.profile_picture}`
          : null,
      },
    });

  } catch (error) {
    console.error("Create Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


// export const getEmployees = async (req, res) => {
//   try {
//     const BASE_URL = process.env.APP_URL;

//     const employees = await Employee.find().populate(
//       "role_id",
//       "role_name description",
//     );

//     const employeesWithImageUrl = employees.map((emp) => ({
//       ...emp._doc,
//       fullImageUrl: emp.image ? `${BASE_URL}${emp.image}` : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Employees fetched successfully",
//       data: employeesWithImageUrl,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


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

// export const updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     const BASE_URL = process.env.APP_URL;

//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

  
//     if (data.email || data.phone) {
//       const exists = await Employee.findOne({
//         _id: { $ne: id },
//         $or: [
//           data.email ? { email: data.email } : null,
//           data.phone ? { phone: data.phone } : null,
//         ].filter(Boolean),
//       });

 
//     }

   
//     if (data.role_id) {
//       const role = await Role.findById(data.role_id);
//       if (!role) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid role selected",
//         });
//       }
//     }

 
//     let imagePath = employee.image;

//     if (req.file) {
   
//       if (employee.image) {
//         const oldPath = path.join(process.cwd(), employee.image);
//         if (fs.existsSync(oldPath)) {
//           fs.unlinkSync(oldPath);
//         }
//       }
//       imagePath = `/uploads/employees/${req.file.filename}`;
//     }

 
//     employee.pan_number = data.pan_number ?? employee.pan_number;
//     employee.aadhaar_number = data.aadhaar_number ?? employee.aadhaar_number;
//     employee.name = data.name ?? employee.name;
//     employee.email = data.email ?? employee.email;
//     employee.phone = data.phone ?? employee.phone;
//     employee.address = data.address ?? employee.address;
//     employee.city = data.city ?? employee.city;
//     employee.state = data.state ?? employee.state;
//     employee.country = data.country ?? employee.country;
//     employee.pincode = data.pincode ?? employee.pincode;
//     employee.role_id = data.role_id ?? employee.role_id;
//     employee.basic_salary = data.basic_salary ?? employee.basic_salary;
//     employee.image = imagePath;
//     employee.status = data.status ?? employee.status;

//     await employee.save();

//     const populatedEmployee = await Employee.findById(employee._id).populate(
//       "role_id",
//       "role_name description",
//     );

//     return res.json({
//       success: true,
//       message: "Employee updated successfully",
//       data: {
//         ...populatedEmployee._doc,
//         fullImageUrl: populatedEmployee.image
//           ? `${BASE_URL}${populatedEmployee.image}`
//           : null,
//       },
//     });
//   } catch (error) {
//     console.error("Update Employee Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const getEmployees = async (req, res) => {
  try {
    const BASE_URL = process.env.APP_URL;

    const employees = await Employee.find()
      .populate("user_role", "role_name description")
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
       .populate("reporting_to", "name email")
      .sort({ createdAt: -1 });

    const employeesWithImageUrl = employees.map((emp) => ({
      ...emp._doc,
      fullImageUrl: emp.profile_picture
        ? `${BASE_URL}${emp.profile_picture}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employeesWithImageUrl,
    });

  } catch (error) {
    console.error("Get Employees Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};





export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const BASE_URL = process.env.APP_URL;

    // 🔍 find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ✅ check duplicate email/phone
    if (data.email || data.phone) {
      const exists = await Employee.findOne({
        _id: { $ne: id },
        $or: [
          data.email ? { email: data.email } : null,
          data.phone ? { phone: data.phone } : null,
        ].filter(Boolean),
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email or phone already exists",
        });
      }
    }

    // ✅ validate role
    if (data.user_role) {
      const role = await Role.findById(data.user_role);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Invalid role selected",
        });
      }
    }

    // ✅ handle image replace
    let imagePath = employee.profile_picture;

    if (req.file) {
      if (employee.profile_picture) {
        const oldPath = path.join(process.cwd(), employee.profile_picture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imagePath = `/uploads/employees/${req.file.filename}`;
    }

    // ✅ update fields safely
    employee.pan_number = data.pan_number ?? employee.pan_number;
    employee.aadhaar_number = data.aadhaar_number ?? employee.aadhaar_number;
employee.reporting_to = data.reporting_to ?? employee.reporting_to;
    employee.name = data.name ?? employee.name;
    employee.email = data.email ?? employee.email;
    employee.mobile = data.mobile ?? employee.mobile;
    employee.address = data.address ?? employee.address;
    employee.city = data.city ?? employee.city;
    employee.state = data.state ?? employee.state;
    employee.country = data.country ?? employee.country;
    
    employee.salutation = data.salutation ?? employee.salutation;
    employee.gender = data.gender ?? employee.gender;
    employee.language = data.language ?? employee.language;
    employee.about = data.about ?? employee.about;

    employee.joining_date = data.joining_date
      ? new Date(data.joining_date)
      : employee.joining_date;

    employee.date_of_birth = data.date_of_birth
      ? new Date(data.date_of_birth)
      : employee.date_of_birth;

    employee.department_id = data.department_id ?? employee.department_id;
    employee.designation_id = data.designation_id ?? employee.designation_id;
    employee.designation_name =
      data.designation_name ?? employee.designation_name;

    employee.user_role = data.user_role ?? employee.user_role;

    employee.basic_salary =
      data.basic_salary !== undefined
        ? Number(data.basic_salary)
        : employee.basic_salary;

    employee.address = data.address ?? employee.address;
    employee.city = data.city ?? employee.city;
    employee.state = data.state ?? employee.state;
    employee.country = data.country ?? employee.country;
    employee.pincode = data.pincode ?? employee.pincode;

    employee.profile_picture = imagePath;

    employee.status = data.status ?? employee.status;

    await employee.save();

    // ✅ populate updated data
    const populatedEmployee = await Employee.findById(employee._id)
      .populate("user_role", "role_name description")
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name");

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: {
        ...populatedEmployee._doc,
        fullImageUrl: populatedEmployee.profile_picture
          ? `${BASE_URL}${populatedEmployee.profile_picture}`
          : null,
      },
    });

  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};