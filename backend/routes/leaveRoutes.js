import express from "express";
import {applyLeave,getLeaves,updateLeaveStatus,deleteLeave, updateLeave
} from "../Controller/leaveController.js";
// import { getLeaveBalance } from "../controllers/leaveBalanceController.js"
import { Leaveupload } from "../middleware/Leaveupload.js";

const router = express.Router();


router.post("/create-leave", Leaveupload.single("attachment"), applyLeave);


router.get("/get-leaves", getLeaves);


router.put("/:id/status", updateLeaveStatus);

// router.get("/balance", getLeaveBalance);

router.delete("/delete-leave/:id", deleteLeave);


router.put("/update-leave/:id", Leaveupload.single("attachment"), updateLeave);

export default router;