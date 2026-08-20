import multer from "multer";

//el archivo vive en memoria y se manda a R2 sin tocar disco
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
