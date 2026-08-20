import { Router } from "express";
import * as mediaController from "./media.controller.js";
import { updateMediaSchema } from "./media.schemas.js";
import { upload } from "../../shared/middleware/upload.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();

//sin `validate(schema)`: el cuerpo es multipart, no JSON, asi que las reglas
//viven en el service
router.post("/", upload.single("file"), mediaController.create);

//corregir el alt manda JSON, no multipart, asi que aqui si hay `validate`
router.put("/:id", validate(updateMediaSchema), mediaController.update);

export default router;
