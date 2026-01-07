import express from "express";
import { createSale } from "../Controller/salesController.js"

const router = express.Router();

router.post("/sale", createSale);

export default router;
