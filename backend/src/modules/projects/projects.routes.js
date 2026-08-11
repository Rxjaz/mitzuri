import { Router } from "express";
import * as projectsController from "./projects.controller.js";
import { createProjectSchema, updateProjectSchema } from "./projects.schemas.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();

router.get("/", projectsController.getAll);
router.post("/", validate(createProjectSchema), projectsController.create);
router.get("/:id", projectsController.getById);
router.put("/:id", validate(updateProjectSchema), projectsController.update);
router.delete("/:id", projectsController.remove);

router.post("/:id/publish", projectsController.publish);
router.post("/:id/unlist", projectsController.unlist);
router.post("/:id/unpublish", projectsController.unpublish);

export default router;