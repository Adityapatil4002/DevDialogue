import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../Controllers/project.controller.js";
import * as authMiddleWare from "../Middleware/auth.middleware.js";

const router = Router();


router.put('/leave', authMiddleWare.authUser, projectController.leaveProject);
router.delete('/delete', authMiddleWare.authUser, projectController.deleteProject);


router.post(
  "/create",
  authMiddleWare.authUser,
  body("name").isString().withMessage("Project name is required"),
  projectController.createProject
);

router.get("/all", authMiddleWare.authUser, projectController.getAllProjects);

router.get(
  "/get-project/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectById
);

router.put(
  "/update-file-tree",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("fileTree").isObject().withMessage("File tree is required"),
  projectController.updateFileTree
);

// --- NEW FEATURES (Privacy & Invites) ---

router.get(
  "/user-search",
  authMiddleWare.authUser,
  projectController.getUserByExactEmail
);

router.post(
  "/send-invite",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  projectController.sendInvite
);

router.put(
  "/accept-invite",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.acceptInvite
);

router.put(
  "/reject-invite",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.rejectInvite
);

export default router;
