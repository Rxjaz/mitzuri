import { Router } from "express";
import * as sectionsController from "./sections.controller.js";
import {
  createSectionSchema,
  reorderSectionsSchema,
  updateSectionSchema,
} from "./sections.schemas.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

//las secciones cuelgan de un proyecto para listar, crear y reordenar; se montan
//bajo /admin/projects
export const projectSectionsRouter = Router();

projectSectionsRouter.get(
  "/:projectId/sections",
  sectionsController.getByProject
);

projectSectionsRouter.post(
  "/:projectId/sections",
  validate(createSectionSchema),
  sectionsController.create
);

projectSectionsRouter.put(
  "/:projectId/sections/reorder",
  validate(reorderSectionsSchema),
  sectionsController.reorder
);

//una vez creada, la seccion se identifica sola: se monta bajo /admin/sections
export const sectionsRouter = Router();

sectionsRouter.put(
  "/:id",
  validate(updateSectionSchema),
  sectionsController.update
);

sectionsRouter.delete("/:id", sectionsController.remove);
