import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { Schedule } from "../models/schedule.model.js";

// --- Initialize Telegram Bot ---
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const enablePolling = (() => {
  const raw = process.env.TELEGRAM_POLLING;
  if (typeof raw === "string" && raw.length > 0) {
    return raw.toLowerCase() === "true";
  }
  // Default: polling ON in dev, OFF in production.
  return process.env.NODE_ENV !== "production";
})();

export const bot = (() => {
  if (!telegramToken) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN is not set; reminders disabled");
    return null;
  }
  try {
    const instance = new TelegramBot(telegramToken, { polling: enablePolling });

    if (enablePolling) {
      // If a webhook was set previously, polling can behave unexpectedly.
      instance
        .deleteWebHook({ drop_pending_updates: true })
        .catch((err) =>
          console.warn("[telegram] deleteWebHook failed:", err?.message || err)
        );
    }

    instance.on("polling_error", (err) => {
      console.error("[telegram] polling_error:", err?.message || err);
    });
    instance.on("webhook_error", (err) => {
      console.error("[telegram] webhook_error:", err?.message || err);
    });
    instance.on("error", (err) => {
      console.error("[telegram] error:", err?.message || err);
    });

    return instance;
  } catch (err) {
    console.error("[telegram] failed to initialize bot:", err?.message || err);
    return null;
  }
})();
const jobs = {};

// --- Main Setup Function ---
export const telegramSetup = async () => {
  if (!bot) {
    console.warn("[telegram] bot not initialized; skipping scheduler setup");
    return;
  }

  console.log(`[telegram] bot started ✅ (polling=${enablePolling})`);

  // Listen for /start command only when polling is enabled
  if (enablePolling) {
    bot.onText(/\/start/, (msg) => {
      bot.sendMessage(msg.chat.id, "👋 Hey! Your reminder bot is active.");
    });
  }

  // Load all active schedules from DB on startup
  const schedules = await Schedule.find({ active: true });
  schedules.forEach((doc) => startTelegramJob(doc));
  console.log(`[telegram] loaded ${schedules.length} active schedules`);
};

// --- Start a New Reminder Job ---
export const startTelegramJob = async (doc) => {
  if (!bot) {
    console.warn("[telegram] bot not initialized; cannot start job");
    return null;
  }

  const id = String(doc._id);
  if (jobs[id]) jobs[id].stop(); // Clear previous job if exists

  const job = cron.schedule(doc.cronTime, async () => {
    try {
      const fresh = await Schedule.findById(id);
      if (!fresh || !fresh.active) return;

      await bot.sendMessage(fresh.chatId, fresh.message);
      console.log(`[telegram] sent reminder to ${fresh.chatId}`);

      // Decrease remaining runs & deactivate if done
      fresh.remainingRuns = Math.max(0, (fresh.remainingRuns || 1) - 1);
      if (fresh.remainingRuns <= 0) {
        fresh.active = false;
      }
      await fresh.save();

      if (!fresh.active) {
        job.stop();
        delete jobs[id];
        console.log(`[telegram] completed and stopped job ${id}`);
      }
    } catch (err) {
      console.error("[telegram] send failed:", err?.message || err);
    }
  },{
  timezone: "Asia/Kolkata"
});

  jobs[id] = job;
  return job;
};
