import express from "express";
import { bot } from "../services/telegram.service.js";
import { Schedule } from "../models/schedule.model.js";

const router = express.Router();

// Send a one-off test message to a chatId (useful for debugging)
// POST /api/debug/send
// body: { chatId: string, message: string }
router.post("/send", async (req, res) => {
  try {
    const { chatId, message } = req.body || {};
    if (!chatId || !message)
      return res.status(400).json({ error: "chatId and message required" });
    if (!bot)
      return res.status(500).json({ error: "Telegram bot not initialized" });
    await bot.sendMessage(chatId, String(message));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// List active schedules (for debugging) -- unauthenticated on purpose for local debugging
router.get("/schedules", async (req, res) => {
  try {
    const list = await Schedule.find({}).lean().limit(200);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

export default router;
