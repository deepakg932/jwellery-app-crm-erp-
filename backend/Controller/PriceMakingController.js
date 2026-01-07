import Pricemaking from "../Models/models/PricemakingModel.js";

export const createPriceMaking = async (req, res) => {
  try {
    const { stage_name, sub_stage_name, cost_type, cost_amount, unit_name } =
      req.body;
    console.log(req.body, "req.body");
    if (
      !stage_name ||
      !sub_stage_name ||
      !cost_type ||
      !unit_name ||
      !cost_amount
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields.",
        });
    }
    const check = await Pricemaking.findOne({ cost_amount });
    if (check) {
      return res
        .status(400)
        .json({ success: false, message: "Price Making already exists." });
    }
    let finalAmount = cost_amount;
    console.log(unit_name, "unit_name");

    if (unit_name === "dozen") {
      finalAmount = cost_amount / 12; // per piece rate
    }

    if (unit_name === "ten-gram") {
      finalAmount = cost_amount / 10; // per gram rate
    }

    if (unit_name === "gram") {
      finalAmount = cost_amount; // same
    }

    if (unit_name === "piece") {
      finalAmount = cost_amount; // same
    }

    const priceMaking = await Pricemaking.create({
      stage_name,
      sub_stage_name,
      cost_type,
      cost_amount,
      finalAmount: finalAmount,
      unit_name,
    });
    console.log("Created Price Making:", priceMaking);
    return res.json({
      success: true,
      message: "Price Making created successfully",
      data: priceMaking,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getPriceMakings = async (req, res) => {
  try {
    const { 
      stage_name, 
      sub_stage_name, 
      cost_type, 
      is_active,
      search,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // Exact match filters
    if (stage_name) filter.stage_name = stage_name;
    if (sub_stage_name) filter.sub_stage_name = sub_stage_name;
    if (cost_type) filter.cost_type = cost_type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    
    // Search across multiple fields
    if (search) {
      filter.$or = [
        { stage_name: { $regex: search, $options: "i" } },
        { sub_stage_name: { $regex: search, $options: "i" } },
        { cost_type: { $regex: search, $options: "i" } },
        { unit_name: { $regex: search, $options: "i" } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const [priceMakings, totalCount] = await Promise.all([
      Pricemaking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Pricemaking.countDocuments(filter)
    ]);
    
    console.log(`Fetched ${priceMakings.length} price makings`);
    
    return res.json({ 
      success: true, 
      data: priceMakings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error fetching price makings:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

export const updatePriceMaking = async (req, res) => {
  try {
    const { stage_name, sub_stage_name, cost_type, cost_amount, name } =
      req.body;
    console.log(req.body, "req.body");
    const updated = await Pricemaking.findByIdAndUpdate(
      req.params.id,
      { stage_name, sub_stage_name, cost_type, cost_amount, name },
      { new: true }
    );
    console.log("Updated Price Making:", updated);
    return res.json({
      success: true,
      message: "Price Making updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePriceMaking = async (req, res) => {
  try {
    const deleted = await Pricemaking.findByIdAndDelete(req.params.id);
    console.log("Deleted Price Making:", deleted);
    return res.json({
      success: true,
      message: "Price Making deleted",
      data: deleted,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
