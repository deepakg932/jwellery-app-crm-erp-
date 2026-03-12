import express from "express";
import {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType,
} from "../Controller/leaveTypeController.js";

const router = express.Router();

router.post("/create-leave-type", createLeaveType);
router.get("/get-leave-types", getLeaveTypes);
router.put("/update-leave-type/:id", updateLeaveType);
router.delete("/delete-leave-type/:id", deleteLeaveType);

export default router;