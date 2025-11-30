import { Router } from "express";
import * as userController from "../Controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../Middleware/auth.middleware.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save to 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Rename file to avoid collisions (e.g., user-123-avatar.png)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const upload = multer({ storage: storage });

router.post(
  "/upload-avatar",
  authMiddleware.authUser,
  upload.single("image"),
  userController.uploadAvatarController
);

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

router.get(
  "/profile",
  authMiddleware.authUser,
  userController.profileController
);
router.get("/logout", authMiddleware.authUser, userController.logoutController);
router.get(
  "/all",
  authMiddleware.authUser,
  userController.getAllUsersController
);
router.get(
  "/dashboard",
  authMiddleware.authUser,
  userController.getDashboardStats
);

// --- NEW PROFILE ROUTES ---
router.put(
  "/update",
  authMiddleware.authUser,
  userController.updateProfileController
);
router.put(
  "/change-password",
  authMiddleware.authUser,
  userController.changePasswordController
);
router.delete(
  "/delete",
  authMiddleware.authUser,
  userController.deleteAccountController
);

router.delete(
  "/delete-avatar",
  authMiddleware.authUser,
  userController.deleteAvatarController
);


export default router;
