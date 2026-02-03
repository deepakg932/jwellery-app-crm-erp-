import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/jobCards/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});



// export const jobStageUpload = multer({ storage })

export const jobCardUpload = multer({ storage }).array("images", 10);

