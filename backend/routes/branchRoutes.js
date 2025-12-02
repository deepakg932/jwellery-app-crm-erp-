import express from 'express';
import { createBranch, getBranches, getBranchById, updateBranch, deleteBranch } from "../Controller/branchController.js";

const router = express.Router();

router.post("/createBranch", createBranch);
router.get("/", getBranches);
router.get("/:id", getBranchById);
router.put("/:id", updateBranch);
router.delete("/:id", deleteBranch);

export default router;
