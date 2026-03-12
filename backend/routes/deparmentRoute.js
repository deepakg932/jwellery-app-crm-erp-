
import express from "express";
import { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../Controller/departmentController.js";
const router = express.Router();

router.post("/create-department", createDepartment);
router.get("/get-departments", getDepartments);


router.get("/get-department/:id", getDepartmentById);
router.put("/update-department/:id", updateDepartment);


router.delete("/delete-department/:id", deleteDepartment);

export default router;