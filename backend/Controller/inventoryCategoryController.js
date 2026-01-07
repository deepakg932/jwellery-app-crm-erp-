import InventoryCategory from "../Models/models/InventoryCategory.js";

import mongoose from "mongoose";

export const createInventoryCategory = async (req, res) => {
  try {
 
      const {name,description}= req.body;
    console.log(req.body,"req.body")


    const existingCategory = await InventoryCategory.findOne({ name }); if (existingCategory) {
       return res.status(400).json({ success: false, message: "Inventory Category name already exists" });
       }

    

  

    const category = await InventoryCategory.create({
      name,
      description,
  
    });
    console.log(category,"category")

 
    return res.status(200).json({success: true,message: "Inventory Category created successfully",data: category});

  } catch (err) {
    console.error("Create Inventory Category Error:", err);
    return res.status(500).json({success: false,message: err.message});
  }
};





export const updateInventoryCategory = async (req, res) => { 
  try { const { name, description } = req.body;
   const categoryId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) { 
    return res.status(400).json({ success: false, message: "Invalid inventory category id" });
   } 
  const existingCategory = await InventoryCategory.findOne({ name, _id: { $ne: categoryId } });
   if (existingCategory) { 
    return res.status(400).json({ success: false, message: "Inventory Category name already exists" }); 
  } 
  console.log(existingCategory,"exiting")
  const updatedCategory = await InventoryCategory.findByIdAndUpdate( categoryId, { name, description },
     { new: true } ); 
     if (!updatedCategory) 
      {
     return res.status(404).json({ success: false, message: "Inventory Category not found" });
     }
     console.log("updatedCategory",updatedCategory,"okkkk")
      return res.status(200).json({ success: true, message: "Inventory Category updated successfully", 
        data: updatedCategory });
       } 
        catch (err) {
           console.error("Update Inventory Category Error:", err); 
          return res.status(500).json({ success: false, message: err.message }); } 
        };






// export const updateInventoryCategory = async (req, res) => {
//   try {
//     // const { name, material_type, parent_category_id } = req.body;
//         const { name, material_type } = req.body;
//     const categoryId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//       return res.status(400).json({success: false,message: "Invalid inventory category id"});
//     }

//     if (!name || !material_type) {
//       return res.status(400).json({success: false,message: "name and material_type (id) are required"});
//     }

//     if (!mongoose.Types.ObjectId.isValid(material_type)) {
//       return res.status(400).json({success: false, message: "material_type must be a valid ObjectId"});
//     }

//     let metals = [];
//     let stones = [];
//     let materials = [];

    
//     const metalDoc = await Metal.findById(material_type);
//     if (metalDoc) {
//       metals.push({ metal_id: metalDoc._id });
//     } else {
    
//       const stoneDoc = await StoneType.findById(material_type);
//       if (stoneDoc) {
//         stones.push({ stone_id: stoneDoc._id });
//       } else {
//         const materialDoc = await MaterialTypes.findById(material_type);
//         if (materialDoc) {
//           materials.push({ material_id: materialDoc._id });
//         } else {
//           return res.status(404).json({success: false,message: "ID not found in Metal, StoneType or MaterialTypes" });
//         }
//       }
//     }

    
//     const updatedCategory = await InventoryCategory.findByIdAndUpdate(
//       categoryId,
//       {
//         name,
//         // parent_category_id: parent_category_id || null,
//         metals,
//         stones,
//         materials
//       },
//       { new: true }
//     )
//       .populate("metals.metal_id", "name")
//       .populate("stones.stone_id", "stone_type")
//       .populate("materials.material_id", "material_type");

//     if (!updatedCategory) {
//       return res.status(404).json({success: false,message: "Inventory Category not found"});
//     }

//     console.log("Updated Inventory Category:", updatedCategory);

//     return res.json({success: true,message: "Inventory Category updated successfully",data: updatedCategory });

//   } catch (err) {
//     console.error("Update Inventory Category Error:", err);
//     return res.status(500).json({success: false,message: err.message});
//   }
// };


export const deleteInventoryCategory = async (req, res) => {
    try{
        let checkerd = await InventoryCategory.findByIdAndDelete(req.params.id);
        
        
        console.log(checkerd,"checked")
        if(!checkerd){
            return res.status(400).json({status:false,message:"Category not found"})
        }
        return res.json({ success: true, message: "Inventory Category deleted" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getInventoryCategories = async (req, res) => {

    try {
        const categories = await InventoryCategory.find()
        // .populate("metals.metal_id", "name")
        // .populate("stones.stone_id", "stone_type")
        // .populate("materials.material_id", "material_type")
        // .sort({ createdAt: -1 });
        console.log(categories,"categories")
        return res.json({ success: true, data: categories });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};




