import Branch from '../Models/models/Branch.js';
import BranchType from '../Models/models/BranchType.js';

export const createBranch = async (req, res) => {
  try {
    const { branch_name,branch_code, address, status, branch_type ,contact_person,is_warehouse,phone} = req.body;
    console.log(req.body,"req.body")
    const a = await Branch.findOne({branch_name:branch_name})
    console.log(a,"duplicate")
    if(a){
      return res.status(400).json({status:false,message:"Branch already exit"})
    }

    const branch = await Branch.create({branch_name,branch_code,branch_type ,contact_person,address,is_warehouse,status,phone});
    console.log(branch,"branch")

    const populatedBranch = await Branch.findById(branch._id)
      .populate("branch_type", "_id branch_type")

      console.log(populatedBranch,"populatedBranch")

    return res.status(201).json({success: true,data: populatedBranch});

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const branchTypes =async (req,res)=>{
  try{
    let {branch_type} = req.body;
    console.log(branch_type,"branch_type")
    if(!branch_type){
      return res.status(400).json({status:false,message:"Branch Type is required"})
    }

    let checked = await BranchType.findOne({branch_type:branch_type})
    console.log(checked,"checked")
    

    let creatded  = await BranchType.create({
      branch_type:branch_type

    })
    console.log(creatded,"creatded")
    return res.status(200).json({ success: true, creatded });

  }catch(err){
    return res.status(500).json({ success: false, message: err.message });

  }
}




export const updateBranchType = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_type } = req.body;
    
    console.log(branch_type, "branch_type for update");
    
    
    if (!id) {
      return res.status(400).json({ status: false, message: "Branch ID is required" });
    }
    
    if (!branch_type) {
      return res.status(400).json({ status: false, message: "Branch Type is required" });
    }

    const existingBranch = await BranchType.findById(id);
    if (!existingBranch) {
      return res.status(404).json({ status: false, message: "Branch not found" });
    }

   
    const typeExists = await BranchType.findOne({
      branch_type: branch_type,
      _id: { $ne: id } 
    });
    console.log(typeExists,"exitTyyes")
    
    if (typeExists) {
      return res.status(400).json({ status: false, message: "Branch Type already exists. Please use a different type." });
    }

    const updatedBranch = await BranchType.findByIdAndUpdate(                                                                                                                                                                                                                                                                                                                   
      id,
      { 
        branch_type: branch_type,
        updatedAt: Date.now()
      },
      { 
        new: true, 
        runValidators: true
      }
    ).select('_id branch_type branch_name');

    console.log(updatedBranch, "updatedBranch");
    
    return res.status(200).json({  success: true,  message: "Branch type updated successfully", data: updatedBranch 
    });

  } catch (err) {
    console.error(err, "error in updateBranchType");
    return res.status(500).json({ success: false, message: "Server error", error: err.message 
    });
  }
};



export const deleteBranchType = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(id, "branch id to delete");
    
    if (!id) {
      return res.status(400).json({ status: false, message: "Branch ID is required" });
    }

  
    const existingBranch = await BranchType.findById(id);
    if (!existingBranch) {
      return res.status(404).json({ status: false, message: "Branch not found" });
    }


    const deletedBranch = await BranchType.findByIdAndDelete(
      id,
      { status: false,updatedAt: Date.now()
      },
      { new: true }
    ).select('_id branch_type branch_name status');

    console.log(deletedBranch, "deletedBranch");
    
    return res.status(200).json({ success: true, message: "Branch deleted successfully",data: deletedBranch });

  } catch (err) {
    console.error(err, "error in deleteBranchType");
    return res.status(500).json({ success: false, message: "Server error", error: err.message  });
  }
};



export const getAllBranchTypes = async (req, res) => {
  try {
  
    const branches = await BranchType.find({}) .select('branch_type branch_name _id') .sort({ createdAt: -1 });
      console.log(branches,"branches")
    
    return res.status(200).json({status: true, message: "Branch types fetched successfully", data: branches.map(branch => ({_id: branch._id,branch_type: branch.branch_type,branch_name: branch.branch_name}))
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({  status: false,  message: "Server error",  error: err.message  });
  }
};

// export const getBranches = async (req, res) => {
//   try {
//     const branches = await Branch.find({})
//       .select("_id branch_name branch_type address phone status")
//       .populate({
//         path: "branch_type",
//         select: "_id branch_type"
//       })
//       .sort({ branch_name: 1 });

//     console.log(branches, "all branches");

//     return res.status(200).json({success: true,message: "Branches fetched successfully",data: branches.map(branch => ({
//         id: branch._id,
//         name: branch.branch_name,
//         address: branch.address,
//         phone: branch.phone,
//         status: branch.status,
//         branch_type: {
//           id: branch.branch_type?._id,
//           name: branch.branch_type?.branch_type
//         }
//       }))
//     });

//   } catch (err) {
//     return res.status(500).json({success: false,message: "Server error",error: err.message});
//   }
// };


export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    console.log(branch, "branch by id");
    return res.json({ success: true, branch });
  } catch (err) {
   return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({success: false,message: "Branch ID is required",
      });
    }

    
    const updated = await Branch.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({success: false,message: "Branch not found",});
    }

  
    const populatedBranch = await Branch.findById(updated._id)
      .populate({
        path: "branch_type",
        select: "_id branch_type",
      });

    console.log(populatedBranch, "updated branch with populate");

    return res.status(200).json({success: true,data: populatedBranch,});

  } catch (err) {
    return res.status(500).json({success: false,message: err.message,});
  }
};


export const deleteBranch = async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
  return  res.json({ success: true, message: "Branch deleted" });
  } catch (err) {
   return  res.status(500).json({ success: false, message: err.message });
  }
};


export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({})
      .select("_id branch_name branch_code branch_type address phone contact_person is_warehouse status")
      .populate({
        path: "branch_type",
        select: "_id branch_type"
      })
      .sort({ branch_name: 1 });

    console.log(branches, "all branches");

    return res.status(200).json({
      success: true,
      message: "Branches fetched successfully",
      data: branches.map(branch => ({
        id: branch._id,
        branch_name: branch.branch_name,
        branch_code: branch.branch_code,
        address: branch.address,
        phone: branch.phone,
        contact_person: branch.contact_person,
        is_warehouse: branch.is_warehouse,
        status: branch.status,
        branch_type: {
          id: branch.branch_type?._id,
          name: branch.branch_type?.branch_type
        }
      }))
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
