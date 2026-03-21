import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../Controllers/project.controller.js";

// 1. FIXED: Changed from require() to import to match your ES6 module syntax
import { requireAuth } from "@clerk/express";

const router = Router();

// 2. FIXED: Replaced old authMiddleWare with requireAuth() consistently
router.put("/leave", requireAuth(), projectController.leaveProject);
router.delete("/delete", requireAuth(), projectController.deleteProject);

// 3. FIXED: Merged duplicate routes while keeping your express-validator logic
router.post(
  "/create",
  requireAuth(),
  body("name").isString().withMessage("Project name is required"),
  projectController.createProject,
);

router.get("/all", requireAuth(), projectController.getAllProjects);

router.get(
  "/get-project/:projectId",
  requireAuth(),
  projectController.getProjectById,
);

router.put(
  "/update-file-tree",
  requireAuth(),
  body("projectId").isString().withMessage("Project ID is required"),
  body("fileTree").isObject().withMessage("File tree is required"),
  projectController.updateFileTree,
);

// --- NEW FEATURES (Privacy & Invites) ---

router.get(
  "/user-search",
  requireAuth(),
  projectController.getUserByExactEmail,
);

router.post(
  "/send-invite",
  requireAuth(),
  body("projectId").isString().withMessage("Project ID is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  projectController.sendInvite,
);

router.put(
  "/accept-invite",
  requireAuth(),
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.acceptInvite,
);

router.put(
  "/reject-invite",
  requireAuth(),
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.rejectInvite,
);

export default router;
