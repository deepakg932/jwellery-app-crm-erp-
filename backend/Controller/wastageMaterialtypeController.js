import MaterialTypes from "../Models/models/MaterialTypes.js";

export const createWastageMaterialType = async (req, res) => {
  try {
    const { material_type, metal_id } = req.body;

    if (!material_type || !metal_id) {
      return res.status(400).json({
        success: false,
        message: "Material type and metal are required"
      });
    }

    const exists = await MaterialTypes.findOne({ material_type });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Wastage Material Type already exists"
      });
    }

    const newMaterialType = await MaterialTypes.create({
      material_type,
      metal_id
    });

    // populate metal name
    const populated = await newMaterialType.populate("metal_id", "material_type");

    return res.status(201).json({
      success: true,
      message: "Wastage Material Type created successfully",
      data: populated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating Wastage Material Type",
      error: error.message
    });
  }
};



export const getWastageMaterialTypes = async (req, res) => {
  try {
    const materialTypes = await MaterialTypes
      .find()
      .populate("metal_id", "name");

    return res.status(200).json({
      success: true,
      data: materialTypes
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching Wastage Material Types",
      error: error.message
    });
  }
};

export const updateWastageMaterialType = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id");
    const { material_type } = req.body;
    console.log(req.body,"req.body");
    const updatedMaterialType = await MaterialTypes.findByIdAndUpdate(
      id,
      { material_type},
        { new: true }
    );
    if (!updatedMaterialType) {
      return res.status(404).json({ message: "Wastage Material Type not found" });
    }
    return res.status(200).json({ message: "Wastage Material Type updated successfully", data: updatedMaterialType });
  } catch (error) {
    return res.status(500).json({ message: "Error updating Wastage Material Type", error: error.message });
  }
};

export const deleteWastageMaterialType = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id,"id");
        const deletedMaterialType = await MaterialTypes.findByIdAndDelete(id);
        console.log(deletedMaterialType,"deletedMaterialType");
        if (!deletedMaterialType) {
            return res.status(404).json({ message: "Wastage Material Type not found" });
        }
        return res.status(200).json({ message: "Wastage Material Type deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting Wastage Material Type", error: error.message });
    }
};
