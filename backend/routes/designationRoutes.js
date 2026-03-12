import express from "express";
import { createDesignation, getDesignations, getDesignationById, updateDesignation, deleteDesignation } from "../Controller/designationController.js";
const router = express.Router();

router.post("/create-designation", createDesignation);
router.get("/get-designations", getDesignations);
router.get("/get-designation/:id", getDesignationById);
router.put("/update-designation/:id", updateDesignation);
router.delete("/delete-designation/:id", deleteDesignation);

export default router;