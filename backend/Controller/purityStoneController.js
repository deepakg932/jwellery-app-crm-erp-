import stonePurityModel from "../Models/models/stonePurityModel.js";


import mongoose from "mongoose";


export const createStonePurity = async (req, res) => {
  try {
    const { stone_purity,  stone_type, percentage } = req.body;
    console.log(req.body, "Purity Data");

    if (!stone_purity || !stone_type || !percentage) {
      return res.status(400).json({ success: false, message: "All fields are required"});
    }

   

    const purity = new stonePurityModel({
      stone_purity,
      // stone_name,`
      stone_type,
      percentage,
      
    });
console.log(purity, "New StonePurity");
    const saved = await purity.save();





    return res.json({success: true,purity: {  ...saved._doc}
    });

  } catch (err) {
    return res.status(500).json({success: false,error: err.message});
  }
};





export const getStonePurities= async (req, res) => {
  try {
    console.log("lklklklklklklklklklklk")
    const purities = await stonePurityModel.find().sort({ createdAt: -1 });
    console.log(purities, "Fetched Purities");



    const purityList = purities.map(p => ({
      ...p._doc,

    }));
    console.log(purityList, "Purity List");

    return res.json({success: true,purity: purityList});

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};




export const getPurityById = async (req, res) => {
  try {
    const purity = await stonePurityModel.findById(req.params.id);
    console.log("Fetched Purity by ID:", purity);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, purity });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};






// export const updatePurity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { stone_purity, stone_name, metal_type, percentage } = req.body;

//     const baseUrl = `${req.protocol}://${req.headers.host}`;

//     let purity = await stonePurityModel.findById(id);
//     if (!purity) {
//       return res.status(404).json({
//         success: false,
//         message: "Purity not found"
//       });
//     }

  
//     if (stone_purity) purity.stone_purity = stone_purity;
//     if (stone_name) purity.stone_name = stone_name;
//     if (metal_type) purity.metal_type = metal_type;
//     if (percentage) purity.percentage = percentage;

    
//     if (req.file) {
//       purity.image = `/uploads/purity/${req.file.filename}`;
//     }

//     const updatedPurity = await purity.save();

//     const fullImageUrl = updatedPurity.image
//       ? `${baseUrl}${updatedPurity.image}`
//       : null;

//     return res.json({
//       success: true,
//       message: "Purity updated successfully",
//       purity: {
//         ...updatedPurity._doc,
//         fullImageUrl
//       }
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };




export const deletePurity = async (req, res) => {
  try {
    const purity = await stonePurityModel.findByIdAndDelete(req.params.id);
    if (!purity)
      return res.status(404).json({ success: false, message: "Purity not found" });

    return res.json({ success: true, message: "Purity deleted" ,purity});
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const MetalType = ['gold', 'silver', 'platinum'];


export const updatePurity = async (req, res) => {
  try {
    const { id } = req.params;
    const { stone_purity, stone_type, percentage, status } = req.body;
    
    console.log(req.body, "Update Data for ID:", id);

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format" 
      });
    }

    // Check if record exists
    const existingPurity = await stonePurityModel.findById(id);
    if (!existingPurity) {
      return res.status(404).json({ 
        success: false, 
        message: "Stone purity record not found" 
      });
    }

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage must be between 0 and 100"
      });
    }

    // Prepare update object
    const updateData = {};
    if (stone_purity !== undefined) updateData.stone_purity = stone_purity;
    if (stone_type !== undefined) updateData.stone_type = stone_type;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (status !== undefined) updateData.status = status;

    // Update the record
    const updatedPurity = await stonePurityModel.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,      // Return updated document
        runValidators: true // Run schema validators
      }
    );

    console.log(updatedPurity, "Updated StonePurity");

    return res.status(200).json({
      success: true,
      message: "Stone purity updated successfully",
      purity: updatedPurity
    });

  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};