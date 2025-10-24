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

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project id is required'),
    body('users').isArray().withMessage('Users must be an array'),
    body('users.*').isString().withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
)

export default router;