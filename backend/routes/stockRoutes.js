import express from "express";
import {
  createStockIn,
  getAllStockIn,
    updateStockIn,
  getStockInById,
} from "../Controller/stockInController.js";

const router = express.Router();

router.get("/get-stock-grns", getAllStockIn);


router.post("/create-receive-item", createStockIn);



router.put("/update-receive-item/:id",   updateStockIn,)

router.get("/:id", getStockInById);

export default router;
