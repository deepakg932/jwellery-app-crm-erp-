import InventoryItem from "../Models/models/InventoryModel.js";
import InventoryCategory from "../Models/models/InventoryCategory.js";

export const createInventoryItem = async (req, res) => {
  try {
    const { item_name, inventory_category_id, unit_id,product_id, track_by , weight,
      quantity} = req.body;
    console.log(req.body, "req.body");

    if (!item_name || !inventory_category_id || !track_by) {
      return res.status(400).json({  success: false,message: "item_name, inventory_category_id, track_by are required", });
    }


     if (track_by === "weight" && !weight) {
      return res.status(400).json({ message: "Weight is required" });
    }

    if (track_by === "quantity" && !quantity) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    if (track_by === "both" && (!weight || !quantity)) {
      return res.status(400).json({
        message: "Both weight and quantity are required"
      });
    }

    const category = await InventoryCategory.findById(inventory_category_id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Inventory Category not found" });
    }

    const sku_code = `SKU-${Date.now()}`;
    console.log("sku", sku_code);

    const item = await InventoryItem.create({
      item_name,
      sku_code,
      unit_id,
      inventory_category_id,
      product_id: product_id || null,
      track_by,
       weight: weight || null,
      quantity: quantity || null,

      metals: category.metals || [],
      stones: category.stones || [],
      materials: category.materials || [],
    });
    console.log(item, "item");
    const populatedItem = await InventoryItem.findById(item._id)
      .populate("inventory_category_id", "name")
      .populate("unit_id","name")
      .populate("product_id", "product_name")
      .populate("metals.metal_id", "name")
      .populate("stones.stone_id", "stone_type")
      .populate("materials.material_id", "material_type");
    console.log(populatedItem, "populatesitem");

    return res.status(200).json({success: true,message: "Inventory Item created successfully",data: populatedItem,});
  } catch (err) {
    console.error("Create Inventory Item Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// export const getInventoryItems  = async(req,res)=>{
//   try{
//     const  fetched = await InventoryItem.find()
//     console.log(fetched)
//     return res.status(200).json({status:true,message:"All InventoryItems",fetched})
//   }catch(er){
//     return res.status(500).json({status:false,message:"Internal server"})
//   }
// }

export const getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .populate("inventory_category_id", "name")
      .populate("product_id", "product_name")
      .populate("unit_id","name")
      .populate("metals.metal_id", "name")
      .populate("stones.stone_id", "stone_type")
      .populate("materials.material_id", "material_type");

    console.log(items, "items");

    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id",id)

    const {
      item_name,
      inventory_category_id,
      product_id,
      track_by,
      weight,
      quantity,
      unit_id,
    } = req.body;
console.log(req.body,"req.body")
    const existingItem = await InventoryItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({success: false, message: "Inventory Item not found",});
    }

   
    let updateData = {
      item_name: item_name ?? existingItem.item_name,
      product_id: product_id ?? existingItem.product_id,
      track_by: track_by ?? existingItem.track_by,
      unit_id: unit_id ?? existingItem.unit_id,
      weight: weight ?? existingItem.weight,
      quantity: quantity ?? existingItem.quantity,
    };
console.log(updateData,"updatedata")
   
    if (track_by === "weight") {
      updateData.quantity = null;
    }

    if (track_by === "quantity") {
      updateData.weight = null;
    }


    if (
      inventory_category_id &&
      inventory_category_id.toString() !==
        existingItem.inventory_category_id.toString()
    ) {
      const category = await InventoryCategory.findById(
        inventory_category_id
      );

      if (!category) {
        return res.status(404).json({success: false,message: "Inventory Category not found",});
      }

      updateData.inventory_category_id = inventory_category_id;


      updateData.metals = category.metals || [];
      updateData.stones = category.stones || [];
      updateData.materials = category.materials || [];
    }


    const updatedItem = await InventoryItem.findByIdAndUpdate(id,updateData,
      { new: true }
    )
      .populate("inventory_category_id", "name")
      .populate("product_id", "product_name")
      .populate("unit_id", "name")
      .populate("metals.metal_id", "name")
      .populate("stones.stone_id", "stone_type")
      .populate("materials.material_id", "material_type");

    return res.status(200).json({success: true,message: "Inventory Item updated successfully",data: updatedItem,});
  } catch (error) {
    console.error("Update Inventory Item Error:", error);
    return res.status(500).json({success: false,message: error.message});
  }
};


export const deleteinventoryitem = async (req,res) => {
  try {
    let id = req.params.id;
    console.log(id,"id")
    const deleted = await InventoryItem.findById({ _id: id });
    console.log(deleted, "deleted");
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Inventory not found" });
    } else {
      let c = await InventoryItem.findByIdAndDelete({ _id: id });
      console.log(c, "c");
      return res.status(200).json({ status: true, message: "Inventory deleted successfully" });
    }
  } catch (errr) {
    console.log(errr, "errr");
    return res.status(500).json({ success: false, message: errr.message });
  }
};



