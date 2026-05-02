//librerias
import { Router } from "express";
//middlewares
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
//logica del modulo
import * as authController from "./auth.controller.js";
//schema
import { loginSchema } from "./auth.schemas.js";
//middleware
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;