import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/auth/me").get(authenticate, getCurrentUser);
router.route("/logout").post(authenticate, logout);

export default router;
