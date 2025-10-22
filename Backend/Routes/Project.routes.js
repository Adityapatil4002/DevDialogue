import { Router } from 'express';
import { body } from 'express-validator'
import * as projectController from '../Controllers/project.controller.js';


const router = Router();

router.post('/create',
    body('name').isString().withMessage('Project name is required'),
    projectController.createProject
)

export default router;