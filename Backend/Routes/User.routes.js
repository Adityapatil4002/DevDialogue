import { Router } from "express";
import * as userController from "../Controllers/user.controller.js";
import { authUser } from "../Middleware/auth.middleware.js"; // Correct Import
import { body } from "express-validator";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.createUser // Make sure this matches your controller export (createUser or createAccount)
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.loginController // Make sure this matches your controller export
);

// --- Profile Routes ---

// Get current user details
router.get("/profile", authUser, userController.profileController);

// Update user details
router.put("/update", authUser, userController.updateProfileController);

// Change Password
router.put(
  "/change-password",
  authUser,
  userController.changePasswordController
);

// Delete Account
router.delete("/delete", authUser, userController.deleteAccountController);

// --- Utility Routes ---

router.get("/logout", authUser, userController.logoutController);

router.get("/all", authUser, userController.getAllUsersController);

// --- Dashboard Route (Fixed) ---
router.get("/dashboard", authUser, userController.getDashboardStats);

router.get(
  "/dashboard",
  authMiddleware.authUser,
  userController.getDashboardStats
);

export default router;
