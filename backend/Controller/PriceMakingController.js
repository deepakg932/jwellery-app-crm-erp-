import Pricemaking from "../models/PricemakingModel.js";

export const createPriceMaking = async (req, res) => {
  try {
    const { making_stage_id, making_sub_stage_id, cost_type_id, cost_amount, unit_id } =
      req.body;
    console.log(req.body, "req.body");
    // if (
    //   !stage_name ||
    //   !sub_stage_name ||
    //   !cost_type_id ||
    //   !unit_name ||
    //   !cost_amount
    // ) {
    //   return res
    //     .status(400)
    //     .json({
    //       success: false,
    //       message: "Please provide all required fields.",
    //     });
    // }
    const check = await Pricemaking.findOne({ cost_amount });
    if (check) {
      return res
        .status(400)
        .json({ success: false, message: "Price Making already exists." });
    }
    let finalAmount = cost_amount;
    console.log(unit_id, "unit_id");

    if (unit_id === "dozen") {
      finalAmount = cost_amount / 12; 
    }

    if (unit_id === "ten-gram") {
      finalAmount = cost_amount / 10; 
    }

    if (unit_id === "gram") {
      finalAmount = cost_amount; 
    }

    if (unit_id === "piece") {
      finalAmount = cost_amount; 
    }

    const priceMaking = await Pricemaking.create({
      making_stage_id,
      making_sub_stage_id,
      cost_type_id,
      cost_amount,
      finalAmount: finalAmount,
      unit_id,
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

// export const getPriceMakings = async (req, res) => {
//   try {
//     const { 
//       making_stage_id, 
//       making_sub_stage_id, 
//       cost_type_id, 
//       is_active,
//       search,
//       page = 1, 
//       limit = 10 
//     } = req.query;
    
//     const filter = {};
    
  
//     if (making_stage_id) filter.making_stage_id = making_stage_id;
//     if (making_sub_stage_id) filter.making_sub_stage_id = making_sub_stage_id;
//     if (cost_type_id) filter.cost_type_id = cost_type_id;
//     if (is_active !== undefined) filter.is_active = is_active === 'true';


//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     let query = Pricemaking.find(filter)
//       .populate("making_stage_id", "stage_name")
//       .populate("making_sub_stage_id", "sub_stage_name")
//       .populate("cost_type_id", "cost_type")
//       .populate("unit_id", "unit_name unit_code")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));
    
  
//     // if (search) {
//     //   filter.$or = [
//     //     { making_stage_id: { $regex: search, $options: "i" } },
//     //     { making_sub_stage_id: { $regex: search, $options: "i" } },
//     //     { cost_type_id: { $regex: search, $options: "i" } },
//     //     { unit_id: { $regex: search, $options: "i" } }
//     //   ];
//     // }
    
   
//      let priceMakings = await query;


//       if (search) {
//       const keyword = search.toLowerCase();

//       priceMakings = priceMakings.filter((item) => {
//         return (
//           item?.making_stage_id?.stage_name
//             ?.toLowerCase()
//             .includes(keyword) ||
//           item?.making_sub_stage_id?.sub_stage_name
//             ?.toLowerCase()
//             .includes(keyword) ||
//           item?.cost_type_id?.cost_type
//             ?.toLowerCase()
//             .includes(keyword) ||
//           item?.unit_id?.unit_name
//             ?.toLowerCase()
//             .includes(keyword)
//         );
//       });
//     }


//     const totalCount = await Pricemaking.countDocuments(filter);


//     // const [priceMakings, totalCount] = await Promise.all([
//     //   Pricemaking.find(filter)
//     //     .sort({ createdAt: -1 })
//     //     .skip(skip)
//     //     .limit(parseInt(limit)),
//     //   Pricemaking.countDocuments(filter)
//     // ]);
    
//     console.log(`Fetched ${priceMakings.length} price makings`);
    
//     return res.json({ 
//       success: true, 
//       data: priceMakings,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / parseInt(limit)),
//         totalCount,
//         limit: parseInt(limit)
//       }
//     });
//   } catch (err) {
//     console.error("Error fetching price makings:", err);
//     return res.status(500).json({ 
//       success: false, 
//       error: err.message 
//     });
//   }
// };

export const updatePriceMaking = async (req, res) => {
  try {
    const { making_stage_id, making_sub_stage_id, cost_type_id, unit_id, cost_amount, name } =
      req.body;
    console.log(req.body, "req.body");
    const updated = await Pricemaking.findByIdAndUpdate(
      req.params.id,
      { making_stage_id, making_sub_stage_id, cost_type_id, unit_id, cost_amount, name },
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




export const getPriceMakings = async (req, res) => {
  try {
    const {
      making_stage_id,
      making_sub_stage_id,
      cost_type_id,
      is_active,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (making_stage_id) filter.making_stage_id = making_stage_id;
    if (making_sub_stage_id) filter.making_sub_stage_id = making_sub_stage_id;
    if (cost_type_id) filter.cost_type_id = cost_type_id;
    if (is_active !== undefined)
      filter.is_active = is_active === "true";

    const skip = (Number(page) - 1) * Number(limit);

    let priceMakings = await Pricemaking.find(filter)
      .populate("making_stage_id", "stage_name")
      .populate("making_sub_stage_id", "sub_stage_name")
      .populate({
        path: "cost_type_id",
        select: "cost_type cost_name_id",
        populate: {
          path: "cost_name_id",
          select: "cost_name",
        },
      })
      .populate("unit_id", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

   
    if (search) {
      const keyword = search.toLowerCase();

      priceMakings = priceMakings.filter((item) => {
        return (
          item?.making_stage_id?.stage_name
            ?.toLowerCase()
            .includes(keyword) ||
          item?.making_sub_stage_id?.sub_stage_name
            ?.toLowerCase()
            .includes(keyword) ||
          item?.cost_type_id?.cost_type
            ?.toLowerCase()
            .includes(keyword) ||
          item?.cost_type_id?.cost_name_id?.cost_name
            ?.toLowerCase()
            .includes(keyword) ||
          item?.unit_id?.unit_name
            ?.toLowerCase()
            .includes(keyword)
        );
      });
    }

    const totalCount = await Pricemaking.countDocuments(filter);

    return res.json({
      success: true,
      data: priceMakings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error("Error fetching price makings:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
