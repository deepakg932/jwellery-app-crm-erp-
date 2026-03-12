import express from "express";
import { getAllHolidays,addHolidays,deleteHoliday,getCalendarHolidays,updateHoliday } from "../Controller/holidayController.js"

const router = express.Router();


router.post("/add-holiday",addHolidays)
router.delete("/delete-holiday/:id",deleteHoliday)
router.get("/get-holidays", getAllHolidays);
router.get("/calendar", getCalendarHolidays);
router.put("/update-holiday/:id", updateHoliday);
export default router;