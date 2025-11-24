import { Router } from "express";
import * as userController from "../Controllers/User.Controller.js";
import { authUser } from "../Middleware/auth.middleware.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.createUser
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.loginController
);

// --- Profile Routes ---

// Get current user details
router.get("/profile", authUser, userController.profileController);

// Update user details (Bio, Name, Location, Socials, Settings)
router.put("/update", authUser, userController.updateProfileController);

// [NEW] Change Password
router.put(
  "/change-password",
  authUser,
  userController.changePasswordController
);

// [NEW] Delete Account
router.delete("/delete", authUser, userController.deleteAccountController);

// --- Utility Routes ---

router.get("/logout", authUser, userController.logoutController);

router.get("/all", authUser, userController.getAllUsersController);

export default router;
