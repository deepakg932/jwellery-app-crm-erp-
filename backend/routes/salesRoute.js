import express from "express";
import { createSale } from "../Controller/salesController.js"
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", auth, createSale);

export default router;
