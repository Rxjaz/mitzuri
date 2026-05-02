import { Router } from 'express';
import * as projectsController from './projects.controller.js';
//schema
//import { loginSchema } from './auth.schemas.js';

const router = Router();

router.get('/', projectsController.getAll);
router.post('/', projectsController.create);
router.get('/:id', projectsController.getById);
router.put('/:id', projectsController.update);
router.delete('/:id', projectsController.remove);

router.post('/:id/publish', projectsController.publish);
router.post('/:id/unpublish', projectsController.unpublish);

export default router;