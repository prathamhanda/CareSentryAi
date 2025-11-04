import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createTelegramSchedules } from "../controllers/telegram.controller.js";

const router = Router();

// Telegram-only schedule creation
router.post("/schedules", createTelegramSchedules);


export default router;
