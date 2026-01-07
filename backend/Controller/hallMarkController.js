import Hallmark from "../Models/models/Hallmark.js"
import Purity from "../Models/models/Purity.js";
import Metal from "../Models/models/MetalTypeModel.js"
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

   

    // Fetch metal details to get metal name
    const metal = await Metal.findById(metal_type);
    if (!metal) {
      return res.status(400).json({
        success: false,
        message: "Invalid metal type"
      });
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;

    const hallmark = new Hallmark({
      name,
      metal_type,
      metal_type_name: metal.metal_name || metal.name || "",
      purity_id,
      percentage,
      description: description || "",
      image: req.file ? `/uploads/hallmark/${req.file.filename}` : null
    });

    const saved = await hallmark.save();

    const fullImageUrl = saved.image ? `${baseUrl}${saved.image}` : null;

    return res.status(200).json({
      success: true,
      hallmark: { 
        ...saved._doc, 
        fullImageUrl,
        metal_details: {
          id: metal._id,
          name: metal.metal_name || metal.name
        }
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message 
    });
  }
};




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





export const getHallmarks = async (req, res) => {
  try {
    const hallmarks = await Hallmark.find({ status: true })
      .populate('metal_type_id', 'metal_name name')
      .populate('purity_id', 'purity_name name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      hallmarks
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const getHallmarksByMetal = async (req, res) => {
  try {
    const { metalId } = req.params;
    console.log(metalId,"metaljj")

    if (!metalId || !mongoose.Types.ObjectId.isValid(metalId)) {
      return res.status(400).json({
        success: false,
        message: "Valid metal ID is required"
      });
    }

    const hallmarks = await Hallmark.find({ 
      metal_type: metalId,
      status: true 
    })
      .populate('metal_type_id', 'metal_name name')
      .populate('purity_id', 'purity_name name')
      .sort({ name: 1 });

    // Also get metal details
    const metal = await Metal.findById(metalId);

    return res.status(200).json({
      success: true,
      metal: metal ? {
        id: metal._id,
        name: metal.metal_name || metal.name
      } : null,
      hallmarks,
      count: hallmarks.length
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getHallmarkById = async (req, res) => {
  try {
    const { id } = req.params;

    const hallmark = await Hallmark.findById(id)
      .populate('metal_type_id', 'metal_name name')
      .populate('purity_id', 'purity_name name');

    if (!hallmark) {
      return res.status(404).json({
        success: false,
        message: "Hallmark not found"
      });
    }

    return res.status(200).json({
      success: true,
      hallmark
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const getMetalsWithHallmarks = async (req, res) => {
  try {
    const metals = await Metal.find({ status: true })
      .sort({ metal_name: 1 });

    const metalsWithHallmarks = await Promise.all(
      metals.map(async (metal) => {
        const hallmarks = await Hallmark.find({
          metal_type_id: metal._id,
          status: true
        }).select('name purity_id percentage');

        return {
          _id: metal._id,
          name: metal.metal_name || metal.name,
          hallmarks_count: hallmarks.length,
          hallmarks: hallmarks
        };
      })
    );

    return res.status(200).json({
      success: true,
      metals: metalsWithHallmarks
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// Get complete metal details with purities, hallmarks, rates, etc.
export const getMetalDetails = async (req, res) => {
  try {
    const { metalId } = req.params;

    if (!metalId || !mongoose.Types.ObjectId.isValid(metalId)) {
      return res.status(400).json({
        success: false,
        message: "Valid metal ID is required"
      });
    }

    // Fetch metal details
    const metal = await Metal.findById(metalId);
    
    if (!metal) {
      return res.status(404).json({
        success: false,
        message: "Metal not found"
      });
    }

    // Fetch all related data in parallel
    const [purities, hallmarks, units, currentRate] = await Promise.all([
      // Get purities for this metal
      Purity.find({ 
        metal_id: metalId, // Assuming your Purity model has metal_id field
        status: true 
      }).sort({ purity_name: 1 }),
      
      // Get hallmarks for this metal
      Hallmark.find({ 
        metal_type_id: metalId,
        status: true 
      })
        .populate('purity_id', 'purity_name')
        .sort({ name: 1 }),
      
      // Get available units (you might have a Unit model)
      Unit.find({ status: true }).sort({ unit_name: 1 }),
      
      // Get current rate for this metal (from your rates table if exists)
      // MetalRate.findOne({ metal_id: metalId }).sort({ createdAt: -1 })
      Promise.resolve(null) // Placeholder for rate
    ]);

    // Get making charge types (if you have a separate model)
    const makingCharges = await CostName.find({ status: true }).sort({ cost_type: 1 });

    return res.status(200).json({
      success: true,
      metal: {
        _id: metal._id,
        name: metal.metal_name || metal.name,
        code: metal.metal_code || "",
        description: metal.description || "",
        current_rate: currentRate?.rate || metal.base_rate || 0,
        rate_unit: currentRate?.unit || "per gram",
        // Add other metal properties you have
      },
      purities: purities.map(p => ({
        _id: p._id,
        name: p.purity_name || p.name,
        percentage: p.percentage || 0,
        karat: p.karat || 0
      })),
      hallmarks: hallmarks.map(h => ({
        _id: h._id,
        name: h.name,
        purity_id: h.purity_id?._id,
        purity_name: h.purity_id?.purity_name,
        percentage: h.percentage || 0,
        image: h.image
      })),
      units: units.map(u => ({
        _id: u._id,
        name: u.unit_name || u.name,
        symbol: u.symbol || "",
        conversion_factor: u.conversion_factor || 1
      })),
      making_charges: makingCharges.map(mc => ({
        _id: mc._id,
        name: mc.cost_type || mc.name,
        type: mc.charge_type || "percentage", // percentage, fixed, per_gram
        default_value: mc.default_value || 0
      })),
      summary: {
        purities_count: purities.length,
        hallmarks_count: hallmarks.length,
        units_count: units.length
      }
    });

  } catch (err) {
    console.error("Error fetching metal details:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};