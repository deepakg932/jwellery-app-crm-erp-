import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/stone/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const stoneUpload = multer({ storage: storage });

export default stoneUpload;
