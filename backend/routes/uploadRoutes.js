import express from "express";
import uploadChunk from "../middleware/chunkUpload.js"
import { uploadChunk as uploadChunkController } from "../Controller/uploadController.js"

const router = express.Router();

router.post(
  "/upload-chunk",
  uploadChunk.single("chunk"),
  uploadChunkController
);

export default router;
