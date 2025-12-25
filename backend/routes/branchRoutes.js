import express from 'express';
import { createBranch, getBranches, getBranchById, updateBranch,deleteBranchType, deleteBranch,updateBranchType,branchTypes ,getAllBranchTypes} from "../Controller/branchController.js";

const router = express.Router();

router.post("/create-branch-type",branchTypes)
router.get("/all-branch-types",getAllBranchTypes)
router.put("/update-branch-type/:id",updateBranchType)
router.delete("/delete-branch-type/:id",deleteBranchType)

router.post("/create-branch", createBranch);
router.get("/get-branches", getBranches);
router.get("/:id", getBranchById);
router.put("/update-branch/:id", updateBranch);
router.delete("/delete-branch/:id", deleteBranch);

export default router;
