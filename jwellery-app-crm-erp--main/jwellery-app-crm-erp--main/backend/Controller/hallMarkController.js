import Hallmark from "../Models/models/Hallmark.js"
import Purity from "../Models/models/Purity.js";
import { MetalType } from  "../Models/models/shared.js"


export const getPurityPercentages = async (req, res) => {
  try {
    const purities = await Purity.find().select("percentage purity_name");

    const percentages = purities.map((p) => ({
      purity_name: p.purity_name,
      percentage: p.percentage,
      purity_id: p._id
    }));

    return res.json({ success: true, percentages });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const getHallmarkDashboardStats = async (req, res) => {
  try {
    // Total hallmarks
    const totalHallmarks = await Hallmark.countDocuments();

    // Active hallmarks (if status exists)
    let activeHallmarks = totalHallmarks; // default
    if ("status" in Hallmark.schema.paths) {
      activeHallmarks = await Hallmark.countDocuments({ status: true });
    }

    // Unique metals
    const uniqueMetalsArr = await Hallmark.distinct("metal_type");
    const uniqueMetals = uniqueMetalsArr.length;

    // Average purity
    const hallmarks = await Hallmark.find().select("percentage");
    const totalPercentage = hallmarks.reduce((acc, h) => acc + h.percentage, 0);
    const avgPurity =
      hallmarks.length > 0
        ? Number((totalPercentage / hallmarks.length).toFixed(1))
        : 0;

    return res.json({
      success: true,
      stats: {
        totalHallmarks,
        activeHallmarks,
        uniqueMetals,
        avgPurity
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



// export const updateHallmark = async (req, res) => {
//   try {
//     const { name, purity_id, mark_id, percentage, metal_type, description } = req.body;

//     let hallmark = await Hallmark.findById(req.params.id);
//     if (!hallmark) {
//       return res.status(404).json({ success: false, message: "Hallmark not found" });
//     }

  
//     if (!name || !purity_id || !mark_id || !percentage || !metal_type) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be filled",
//       });
//     }

  
//     hallmark.name = name;
//     hallmark.purity_id = purity_id;
//     hallmark.mark_id = mark_id;
//     hallmark.percentage = percentage;
//     hallmark.metal_type = metal_type;
//     hallmark.description = description || "";

//     const updated = await hallmark.save();

//     return res.json({
//       success: true,
//       message: "Hallmark updated successfully",
//       hallmark: updated
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };


export const deleteHallmark = async (req, res) => {
  try {
    const hallmark = await Hallmark.findByIdAndDelete(req.params.id);
    console.log(hallmark,"deleted hallmark");

    if (!hallmark)
      return res.status(404).json({ success: false, message: "Hallmark not found" });

    return res.json({ success: true, message: "Hallmark deleted" });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getHallmarkById = async (req, res) => {
  try {
    const hallmark = await Hallmark.findById(req.params.id)
      .populate("purity_id")
      // .populate("mark_id");
      console.log(hallmark);

    if (!hallmark)
      return res.status(404).json({ success: false, message: "Hallmark not found" });

    return res.json({ success: true, hallmark });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const getAllHallmarks = async (req, res) => {
  try {
    const data = await Hallmark.find()
      .populate("purity_id")
      // .populate("mark_id");
      console.log(data,"data");

    return res.json({ success: true, hallmarks: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const createHallmark = async (req, res) => {
  try {
    const { name, purity_id, percentage, metal_type, description } = req.body;

    if (!name  || !metal_type) {
      return res.status(400).json({success: false,message: "All required fields must be filled"});
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    console.log("Base URL:", baseUrl);

    const hallmark = new Hallmark({
      name,
      // purity_id,
      // percentage,
      metal_type,
      description: description || "",
      image: req.file ? `/uploads/hallmark/${req.file.filename}` : null
    });
    console.log("Creating Hallmark:", hallmark);

    const saved = await hallmark.save();
    console.log("Saved Hallmark:", saved);

    const fullImageUrl = saved.image ? `${baseUrl}${saved.image}` : null;

    return res.status(200).json({success: true,hallmark: {  ...saved._doc, fullImageUrl }});

  } catch (err) {
    return res.status(500).json({success: false,error: err.message });
  }
};


// export const  createHallmark = async (req, res) => {
//   try {
//     const { name, purity_id, metal_type, description } = req.body;

//     if (!name || !purity_id || !metal_type) {
//       return res.status(400).json({
//         success: false,
//         message: "name, purity_id, metal_type are required"
//       });
//     }

//     // Fetch purity data
//     const purityData = await Purity.findById(purity_id);
//     if (!purityData) {
//       return res.status(404).json({ success: false, message: "Purity not found" });
//     }

//     // Auto-fill percentage from Purity table
//     const percentage = purityData.percentage;

//     const baseUrl = `${req.protocol}://${req.headers.host}`;

//     const hallmark = new Hallmark({
//       name,
//       purity_id,
//       percentage,          // Auto inserted here ✔
//       metal_type,
//       description,
//       image: req.file ? `/uploads/hallmark/${req.file.filename}` : null
//     });

//     const saved = await hallmark.save();

//     const fullImageUrl = saved.image ? `${baseUrl}${saved.image}` : null;

//     return res.json({
//       success: true,
//       hallmark: { ...saved._doc, fullImageUrl }
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

// export const updateHallmark = async (req, res) => {
//   try {
//     const { name, purity_id, percentage, metal_type, description } = req.body;

//     let hallmark = await Hallmark.findById(req.params.id);
//     console.log(hallmark,"hallmark to update");
//     if (!hallmark) {
//       return res.status(404).json({success: false,message: "Hallmark not found"});
//     }

    
//     const baseUrl = `${req.protocol}://${req.headers.host}`;
//     console.log(baseUrl,"baseurl");

 
//     if (!name || !purity_id || !percentage || !metal_type) {
//       return res.status(400).json({ success: false,message: "All required fields must be filled"});
//     }

//     hallmark.name = name;
//     hallmark.purity_id = purity_id;
//     hallmark.percentage = percentage;
//     hallmark.metal_type = metal_type;
//     hallmark.description = description || "";

  
//     if (req.file) {
//       hallmark.image = `/uploads/hallmark/${req.file.filename}`;
//     }

//     const updated = await hallmark.save();
//     console.log(updated,"updated hallmark");

 
//     const fullImageUrl = updated.image
//       ? `${baseUrl}${updated.image}`
//       : null;

//       console.log(fullImageUrl,"fullimageurl");
//     return res.json({success: true,message: "Hallmark updated successfully",hallmark: {...updated._doc,fullImageUrl}
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message});
//   }
// };


export const updateHallmark = async (req, res) => {
  try {
    const { name, purity_id, metal_type, description } = req.body;

    let hallmark = await Hallmark.findById(req.params.id);
    if (!hallmark) {
      return res.status(404).json({
        success: false,
        message: "Hallmark not found"
      });
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;

  
    if (!name || !metal_type) {
      return res.status(400).json({
        success: false,
        message: "name, purity_id & metal_type are required"
      });
    }

    // const purityData = await Purity.findById(purity_id);
    // if (!purityData) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Purity not found"
    //   });
    // }

    // // Auto-calculated percentage
    // const percentage = purityData.percentage;

    // Update TEXT fields
    hallmark.name = name;
    // hallmark.purity_id = purity_id;
    // hallmark.percentage = percentage;   // Auto-filled ✔
    hallmark.metal_type = metal_type;
    hallmark.description = description || "";

    // Update image if new file uploaded
    if (req.file) {
      hallmark.image = `/uploads/hallmark/${req.file.filename}`;
    }

    const updated = await hallmark.save();

    // Build full image URL
    const fullImageUrl = updated.image ? `${baseUrl}${updated.image}` : null;

    return res.json({
      success: true,
      message: "Hallmark updated successfully",
      hallmark: {
        ...updated._doc,
        fullImageUrl
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
