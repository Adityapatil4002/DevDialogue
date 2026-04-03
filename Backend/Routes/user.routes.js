import { Router } from "express";
import * as userController from "../Controllers/user.controller.js";
import { authUser } from "../Middleware/auth.middleware.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1],
    );
  },
});
const upload = multer({ storage });

// All routes protected by Better Auth session
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
router.get("/profile", authUser, userController.profileController);
router.put("/update", authUser, userController.updateProfileController);
router.get("/dashboard", authUser, userController.getDashboardStats);
router.get("/all", authUser, userController.getAllUsersController);
router.delete("/delete", authUser, userController.deleteAccountController);

export default router;
