import Branch from '../Models/models/Branch.js';

export const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    console.log(branch, "created branch");


    return res.status(200).json({ success: true, branch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    console.log(branches, "all branches");

    return res.json({ success: true, branches });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

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
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log(branch, "updated branch");
   return res.json({ success: true, branch });
  } catch (err) {
   return  res.status(500).json({ success: false, message: err.message });
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
