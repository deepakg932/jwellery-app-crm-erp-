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
        
        console.log(categories,"categories")
        return res.json({ success: true, data: categories });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};




