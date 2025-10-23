import { Router } from 'express';
import { body } from 'express-validator'
import * as projectController from '../Controllers/project.controller.js';
import * as authMiddleWare from '../Middleware/auth.middleware.js';


const router = Router();

router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Project name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProjects
)

export default router;