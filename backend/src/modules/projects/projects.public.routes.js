import { Router } from "express";
import * as projectsController from "./projects.controller.js";

//mismo recurso que el admin, distinto publico: aqui no hay authMiddleware
const router = Router();

router.get("/", projectsController.getPublicAll);
router.get("/:slug", projectsController.getPublicBySlug);

export default router;
