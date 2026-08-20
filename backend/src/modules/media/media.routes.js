import { Router } from "express";
import * as mediaController from "./media.controller.js";
import { upload } from "../../shared/middleware/upload.middleware.js";

const router = Router();

//sin `validate(schema)`: el cuerpo es multipart, no JSON, asi que las reglas
//viven en el service
router.post("/", upload.single("file"), mediaController.create);

export default router;
