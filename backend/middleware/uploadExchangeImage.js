import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/exchange",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadExchangeImage = multer({ storage });
export default uploadExchangeImage;