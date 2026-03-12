import experess from 'express';
const router = experess.Router();
import {createEmployee, getEmployees,updateEmployee,deleteEmployee} from "../Controller/employeeController.js"
import uploadEmployeeImage from "../middleware/employeeUpload.js"


// import { authMiddleware } from "../middleware/auth.js";
// import { requireRole } from "../middleware/authorize.js";
//

// router.post(
//   "/",
//   authMiddleware,
//   requireRole(["admin"]),
//   uploadEmployeeImage.single("image"), // 🔥 IMPORTANT
//   createEmployee
// );

router.post('/create-employee', uploadEmployeeImage.single('profile_picture'), createEmployee);
router.get('/get-employees', getEmployees);
router.put('/update-employee/:id', uploadEmployeeImage.single('profile_picture'), updateEmployee);
router.delete('/delete-employee/:id', deleteEmployee);



// router.put(
//   "/:id",
//   authMiddleware,
//   requireRole(["admin"]),
//   uploadEmployeeImage.single("image"),
//   updateEmployee
// );

// router.delete(
//   "/:id",
//   authMiddleware,
//   requireRole(["admin"]),
//   deleteEmployee
// );

// router.get("/", authMiddleware, getEmployees);
export default router;