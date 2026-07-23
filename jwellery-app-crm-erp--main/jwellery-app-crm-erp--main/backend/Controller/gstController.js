import GstRate from "../Models/models/GstRate.js";


export const createGstRate = async (req, res) => {
  try {
    const {
    //   gst_total,
      cgst_percentage,
      sgst_percentage,
      igst_percentage,
      utgst_percentage
    } = req.body;

    // // 🛑 Validation
    // if (!gst_total) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "GST Total is required"
    //   });
    // }

    let gst_total = 0;

     if (igst_percentage > 0) {
      gst_total = igst_percentage;
    } else {
      gst_total = Number(cgst_percentage) + Number(sgst_percentage) + Number(utgst_percentage);
    }

    const newGst = await GstRate.create({
    gst_total,
      cgst_percentage,
      sgst_percentage,
      igst_percentage,
      utgst_percentage
    });
    console.log(newGst,"kkkkkkkkk")

    return res.status(201).json({
      success: true,
      message: "GST Rate Created",
      data: newGst
    });

  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
};



export const getGstRates = async (req, res) => {
  try {
    const gstRates = await GstRate.find({ status: "active" }).sort({ gst_percentage: 1 });

    const modifiedRates = gstRates.map((gst) => {
      const cgst = gst.cgst_percentage || 0;
      const sgst = gst.sgst_percentage || 0;
      const igst = gst.igst_percentage || 0;
      const utgst = gst.utgst_percentage || 0;

      const gst_total = igst > 0 ? igst : (cgst + sgst + utgst);

      return {
        ...gst._doc,
        gst_total
      };
    });

    return res.json({ success: true, data: modifiedRates });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const updateGstRate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      cgst_percentage = 0,
      sgst_percentage = 0,
      igst_percentage = 0,
      utgst_percentage = 0
    } = req.body;

    let gst_total = 0;

    if (igst_percentage > 0) {
      gst_total = igst_percentage;
    } else {
      gst_total = Number(cgst_percentage) + Number(sgst_percentage) + Number(utgst_percentage);
    }

    const updated = await GstRate.findByIdAndUpdate(
      id,
      {
        cgst_percentage,
        sgst_percentage,
        igst_percentage,
        utgst_percentage,
        gst_total
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "GST not found" });
    }

    return res.json({
      success: true,
      message: "GST Rate updated successfully",
      data: updated
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



// DELETE GST RATE (Hard Delete)
export const deleteGstRate = async (req, res) => {
  try {
    const { id } = req.params;

    const gst = await GstRate.findByIdAndDelete(id);
    if (!gst) {
      return res.status(404).json({ success: false, message: "GST rate not found" });
    }

    return res.json({
      success: true,
      message: "GST rate deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
