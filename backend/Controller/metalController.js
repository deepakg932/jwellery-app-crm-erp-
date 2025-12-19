import { MetalType } from "../Models/models/shared.js";
import Metal from "../Models/models/MetalTypeModel.js"

export const createMetal = async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name,"name")

    if (!name) {
      return res.status(400).json({ success: false, message: "Metal name is required" });
    }
// const baseUrl = `${req.protocol}://${req.headers.host}`;
    const baseUrl = `${req.protocol}://${req.get("host")}`; 
    console.log(baseUrl,"baseUrl")

   const metal = new Metal({
    name,
  image: req.file ? `/uploads/metals/${req.file.filename}` : null,
  imageType: "metal"

});


    const saved = await metal.save();

    const fullImageUrl = saved.image ? `${baseUrl}${saved.image}` : null;

    return res.json({  success: true,  metal: {...saved._doc,fullImageUrl}
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// export const createMetal = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.status(400).json({ success: false, message: "Metal name is required" });
//     }

//     // AFTER adding app.set("trust proxy", true)
//     const baseUrl = `${req.protocol}://${req.headers.host}`;
//     console.log("PROTOCOL =", req.protocol);
// console.log("HOST =", req.headers.host);


//     const metal = new Metal({
//       name,
//       image: req.file ? `/uploads/metals/${req.file.filename}` : null,
//       imageType: "metal"
//     });

//     const saved = await metal.save();

//     const fullImageUrl = saved.image ? `${baseUrl}${saved.image}` : null;

//     return res.json({
//       success: true,
//       metal: {
//         ...saved._doc,
//         fullImageUrl
//       }
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };




export const getMetalTypes = async (req, res) => {
  try {
    return res.json({ success: true, metal_types: MetalType });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// export const getMetals = async (req, res) => {
//   try {
//     const metals = await Metal.find().sort({ createdAt: -1 });
//     return res.json({ success: true, metals });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


export const getMetals = async (req, res) => {
  try {
    const metals = await Metal.find().sort({ createdAt: -1 });

    // IMPORTANT: NGROK + DEV TUNNEL only works with req.headers.host
    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const metalsWithFullUrl = metals.map(metal => ({
      ...metal._doc,
      fullImageUrl: metal.image ? `${baseUrl}${metal.image}` : null
    }));

    return res.json({
      success: true,
      metals: metalsWithFullUrl
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



export const getMetalsWithPagination = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Search query
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    // Get total count
    const total = await Metal.countDocuments(searchQuery);

    // Get paginated data
    const metals = await Metal.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      metals
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// export const updateMetal = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(id,"id")
//     const { name } = req.body;
//     console.log(name,"jajja")

//     let metal = await Metal.findById(id);
//     if (!metal) {
//       return res.status(404).json({ success: false, message: "Metal not found" });
//     }

//     if (name) metal.name = name;

    
//     if (req.file) {
//       metal.image = "/metalUpload/metal/" + req.file.filename;
//     }

//     const updatedMetal = await metal.save();

//     return res.json({success: true,message: "Metal updated successfully",metal: updatedMetal});

//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };




export const updateMetal = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id",id)
    const { name } = req.body;
    console.log("name",name)

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    console.log("baseUrl",baseUrl)

    let metal = await Metal.findById(id);
    console.log("metal",metal)
    if (!metal) {
      return res.status(404).json({ success: false, message: "Metal not found" });
    }

    if (name) 
      metal.name = name;

    if (req.file) {
      metal.image = "/metalUpload/metal/" + req.file.filename;
    }

    const updatedMetal = await metal.save();
    console.log("updatedMetal",updatedMetal)

  
    const fullImageUrl = updatedMetal.image ? `${baseUrl}${updatedMetal.image}` : null;

    return res.json({success: true,message: "Metal updated successfully",metal: {  ...updatedMetal._doc,  fullImageUrl}
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteMetal = async (req, res) => {
  try {
    const { id } = req.params;

    const metal = await Metal.findByIdAndDelete(id);

    if (!metal) {
      return res.status(404).json({ success: false, message: "Metal not found" });
    }

    return res.json({ success: true, message: "Metal deleted successfully" });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
