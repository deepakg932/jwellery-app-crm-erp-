import StoneType from "../Models/models/StoneType.js"

export const createStoneType = async (req, res) => {
  try {
    const { stone_type} = req.body;
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!stone_type) {
      return res.status(400).json({success: false,message: "Stone type is required"});
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const stone = new StoneType({
      stone_type,
      stone_image: req.file ? `/uploads/stones/${req.file.filename}` : null
    });

    const saved = await stone.save();

    const fullImageUrl = saved.stone_image ? `${baseUrl}${saved.stone_image}` : null;

    return res.status(200).json({ success: true, message: "Stone created successfully", stone: {   ...saved._doc,   fullImageUrl }
    });

  } catch (err) {
    return res.status(500).json({success: false,message: "Server error",error: err.message
    });
  }
};
export const getAllStoneTypes = async (req, res) => {
  try {
    const stones = await StoneType.find();
    console.log("Fetched Stones:", stones);
   return res.status(200).json({ success: true, stones });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
export const getStoneTypeById = async (req, res) => {
  try {
    const stone = await StoneType.findById(req.params.id);
    console.log("Fetched Stone:", stone);
    if (!stone) {
      return res.status(404).json({ success: false, message: "Stone type not found" });
    }
   return res.status(200).json({ success: true, stone });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateStoneType = async (req, res) => {
  try {
    const { stone_type } = req.body; 

    const stone = await StoneType.findById(req.params.id);
    if (!stone) {
      return res.status(404).json({success: false,message: "Stone not found"
      });
    }

   
    const baseUrl = `${req.protocol}://${req.headers.host}`;

  
    if (stone_type) {
      stone.stone_type = stone_type;
    }

    
    if (req.file) {
      stone.stone_image = `/uploads/stones/${req.file.filename}`;
    }

    const updatedStone = await stone.save();

    const fullImageUrl = updatedStone.image
      ? `${baseUrl}${updatedStone.image}`
      : null;

    return res.status(200).json({
      success: true,message: "Stone updated successfully",
      stone: { ...updatedStone._doc, fullImageUrl
      }
    });

  } catch (err) {
    return res.status(500).json({success: false,message: "Server error",error: err.message});
  }
};



export const deleteStoneType = async (req, res) => {
  try {
    const stone = await StoneType.findById(req.params.id);
    if (!stone) {
      return res.status(404).json({ success: false, message: "Stone type not found" });
    }
    await StoneType.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Stone type deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// export const stonepurity = async (req, res) => {
//   try {
//     const { stone_purity, stone_type } = req.body;

//     // Validate fields
//     if (!stone_purity || !stone_type) {
//       return res.status(400).json({
//         success: false,
//         message: "stone_purity and stone_type are required"
//       });
//     }

//     // Create new stone/purity entry
//     const purity = new StoneType({
//       stone_purity,
//       stone_type
//     });

//     const savedPurity = await purity.save();

//     return res.status(200).json({
//       success: true,
//       message: "Stone purity saved successfully",
//       purity: savedPurity
//     });

//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message
//     });
//   }
// };

export const createStonePurity = async (req, res) => {
  try {
    const { stone_purity, stone_type,percentage} = req.body;

    if (!stone_purity || !stone_type || !percentage ) {
      return res.status(400).json({success: false,message: "All fields are required"
      });
    }

  
    const exists = await StoneType.findOne({ stone_purity, stone_type });
    if (exists) {
      return res.status(400).json({ success: false, message: "Stone purity already exists"});
    }

    const purity = await StoneType.create({stone_purity,stone_type,percentage});

    return res.status(200).json({ success: true, message: "Stone purity created successfully", purity});

  } catch (err) {
    return res.status(500).json({success: false,error: err.message});
  }
};



// export const getstonePurity = async(req,res)=>{
//   const {stone_purity} = req.params
//   console.log("tone_purity,stone_type",stone_purity)
//   try{
//     let check = await StoneType.findOne({stone_purity:stone_purity})
//     console.log(check)
//     if(!check){
//       return res.status(400).json({status:false, message:"Stone purity is not found"})
//     }else{
//       return res.status(200).json({status:true,message:"Data fetched successfully",check})
//     }
//   }catch(e){
//     console.log(e,"e")
//     return res.status(500).json({status:false,message:"Internal error"})

//   }
// }




export const getStonePurities = async (req, res) => {
  try {
    const list = await StoneType.find()
    console.log(list)

    return res.status(200).json({
      success: true,
      purities: list
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



// export const getStonePurityById = async (req, res) => {
//   try {
//     const purity = await StonePurity.findById(req.params.id);

//     if (!purity) {
//       return res.status(404).json({
//         success: false,
//         message: "Stone purity not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       purity
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };



export const stoneupdatepurity= async(req,res)=>{
  const {stone_purity,percentage,price}=req.body;
  console.log("Stone Purity for Update:", stone_purity);
  try{
    const purity=await StoneType.findById(req.params.id);
    console.log("Fetched Purity Document for Update:", purity);
    if(!purity){
      return res.status(404).json({success:false,message:"Stone purity not found"})
    }
    purity.stone_purity=stone_purity || purity.stone_purity;
    purity.percentage = percentage || purity.percentage;
    
    const updatedPurity=await purity.save();
    console.log("Saving Updated Purity Document:", updatedPurity);
    console.log("Updated Purity Document:", updatedPurity);
    return res.status(200).json({success:true,message:"Stone purity updated successfully",purity:updatedPurity})
  }
  catch(err){
   return res.status(500).json({success:false,message:"Server error",error:err.message})
  }
}


export const deletestonepurity = async(req,res)=>{
  try{
    const purity=await StoneType.findById(req.params.id);
    console.log("Fetched Purity Document for Deletion:", purity);
    if(!purity){
      return res.status(404).json({success:false,message:"Stone purity not found"})
    }
    let a = await StoneType.findByIdAndDelete(req.params.id);
    console.log("Deleted Purity Document:", a);
    return res.status(200).json({success:true,message:"Stone purity deleted successfully"})
  }
  catch(err){
   return res.status(500).json({success:false,message:"Server error",error:err.message})
  }
}