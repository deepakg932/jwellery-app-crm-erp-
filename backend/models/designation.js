import mongoose  from "mongoose";

const designationSchema = new mongoose.Schema(
    {
        designation_name: {
            type: String,
        },
        status: {
            type: String,
            default: "active"
        }
    },

    { timestamps: true },
);

export default mongoose.model("Designation", designationSchema)
