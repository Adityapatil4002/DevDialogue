import { Router } from "express";
import * as userController from "../Controllers/user.controller.js";
// Removed express-validator body imports since register/login are gone
import { authUser } from "../Middleware/auth.middleware.js"; // Destructured for cleaner code
import multer from "multer";

const router = Router();

// --- MULTER STORAGE SETUP ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1],
    );
  },
});

const upload = multer({ storage: storage });

// ==========================================
// 🛡️ CLERK-PROTECTED ROUTES
// ==========================================

// Avatar Routes
router.post(
  "/upload-avatar",
  authUser,
  upload.single("image"),
  userController.uploadAvatarController,
);

router.delete(
  "/delete-avatar",
  authUser,
  userController.deleteAvatarController,
);

// Profile & Dashboard Routes
router.get("/profile", authUser, userController.profileController);

router.put("/update", authUser, userController.updateProfileController);

router.get("/dashboard", authUser, userController.getDashboardStats);

// App Data Routes
router.get("/all", authUser, userController.getAllUsersController);

// Account Management Routes
router.delete("/delete", authUser, userController.deleteAccountController);

// We keep the logout route just in case you still have Redis cleanup logic running
router.get("/logout", authUser, userController.logoutController);

export default router;
