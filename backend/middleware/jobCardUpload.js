// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/jobCards/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });



// // export const jobStageUpload = multer({ storage })

// export const jobCardUpload = multer({ storage }).array("images", 10);



import multer from "multer";
import path from "path";

const jobCardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/jobCards");
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const jobCardFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const jobCardUpload = multer({
  storage: jobCardStorage,
  fileFilter: jobCardFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default jobCardUpload;
