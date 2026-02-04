import multer from "multer";
import path from "path";
import fs from "fs";

const tempDir = "uploads/tmp";
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadChunk = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 🔥 10 MB per chunk
  },
});

export default uploadChunk;
