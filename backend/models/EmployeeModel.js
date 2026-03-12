// import mongoose from "mongoose";

// const EmployeeSchema = new mongoose.Schema(
//   {
//     pan_number: {
//       type: String,
//       trim: true,
//     },

//     aadhaar_number: {
//       type: String,
//       trim: true,
//     },
//     role_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Role",
//     },
//     department_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Department",
//     },
//     designation_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Designation",
//     },
//     designation_name: {
//       type: String,
    
//       // trim: true,
//     },
//     about: {
//       type: String,
//     },
//     gender: {
//       type: String,
   
//     },
//     joining_date: {
//       type: Date
//     },
//     date_of_birth: {
//       type: Date
//     },
//     email: {
//       type: String,
   
//       unique: true,
//       // trim: true,
//     },


//     mobile: {
//       type: String,
//       // required: true,
//       // unique: true,
//       // trim: true,
//     },

//     address: String,
//     city: String,
//     state: String,
//     country: String,
//     pincode: String,

//     user_role: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Role",
  
//     },

//     basic_salary: {
//       type: Number,
    
//     },
//     name: {
//       type: String,
   
//     },

//     profile_picture: {
//       type: String,
//       default: null,
//     },
//     salutation: {
//       type: String,
//     },
//     language: {
//       type: String,
//     },

//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },

//     created_by: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// export default mongoose.model("Employee", EmployeeSchema);



import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    mobile: String,


    reporting_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    pan_number: String,
    aadhaar_number: String,

    salutation: String,
    gender: String,
    about: String,
    language: String,

    joining_date: Date,
    date_of_birth: Date,

    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    designation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },

    designation_name: String,

    user_role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },

    // basic_salary: Number,

    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    profile_picture: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", EmployeeSchema);