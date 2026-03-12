import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        department_name: {
            type: String,
        },
        status: {
            type: String,
            default: "active"
        }
    },

    { timestamps: true },
);

export default mongoose.model("Department", departmentSchema);