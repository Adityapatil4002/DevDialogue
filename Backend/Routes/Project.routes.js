import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../Controllers/project.controller.js";

// 👇 FIX: Import our custom bridge instead of Clerk directly 👇
import { authUser } from "../Middleware/auth.middleware.js";

const router = Router();

// 👇 FIX: Replace all instances of requireAuth() with authUser 👇
router.put("/leave", authUser, projectController.leaveProject);
router.delete("/delete", authUser, projectController.deleteProject);

router.post(
  "/create",
  authUser,
  body("name").isString().withMessage("Project name is required"),
  projectController.createProject,
);

router.get("/all", authUser, projectController.getAllProjects);

router.get(
  "/get-project/:projectId",
  authUser,
  projectController.getProjectById,
);

router.put(
  "/update-file-tree",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("fileTree").isObject().withMessage("File tree is required"),
  projectController.updateFileTree,
);

// --- NEW FEATURES (Privacy & Invites) ---

router.get("/user-search", authUser, projectController.getUserByExactEmail);

router.post(
  "/send-invite",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  projectController.sendInvite,
);

router.put(
  "/accept-invite",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.acceptInvite,
);

router.put(
  "/reject-invite",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.rejectInvite,
);

export default router;
