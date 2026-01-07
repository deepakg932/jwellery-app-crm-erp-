import express from "express"

const router = express.Router()

import {createAdjustment}  from "../Controller/stockAdjustmentController.js";


router.post("/adjustment", createAdjustment);

export default router;