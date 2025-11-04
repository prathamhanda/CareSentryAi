import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { Schedule } from "../models/schedule.model.js";

// --- Initialize Telegram Bot ---
export const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const jobs = {};

// --- Main Setup Function ---
export const telegramSetup = async () => {
  console.log("[telegram] bot started ✅");

  // Listen for /start command in Telegram
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "👋 Hey! Your reminder bot is active.");
  });

  // Load all active schedules from DB on startup
  const schedules = await Schedule.find({ active: true });
  schedules.forEach((doc) => startTelegramJob(doc));
  console.log(`[telegram] loaded ${schedules.length} active schedules`);
};

// --- Start a New Reminder Job ---
export const startTelegramJob = async (doc) => {
  const id = String(doc._id);
  if (jobs[id]) jobs[id].stop(); // Clear previous job if exists

  const job = cron.schedule(doc.cronTime, async () => {
    try {
      await bot.sendMessage(doc.chatId, doc.message);
      console.log(`[telegram] sent reminder to ${doc.chatId}`);

      // Decrease remaining runs & deactivate if done
      doc.remainingRuns = Math.max(0, (doc.remainingRuns || 1) - 1);
      await doc.save();

      if (doc.remainingRuns <= 0) {
        job.stop();
        doc.active = false;
        await doc.save();
        delete jobs[id];
        console.log(`[telegram] completed and stopped job ${id}`);
      }
    } catch (err) {
      console.error("[telegram] send failed:", err.message);
    }
  },{
  timezone: "Asia/Kolkata"
});

  jobs[id] = job;
  return job;
};
