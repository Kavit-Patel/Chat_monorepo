import multer from "multer";

export const storage = multer.diskStorage({
  destination(req, file, cb) {
    console.log("first");
    cb(null, "public/uploads");
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});
// export const uploads = multer({ storage }).single("photo");
