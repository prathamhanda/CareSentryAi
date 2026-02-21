import { Schedule } from "../models/schedule.model.js";
import { bot, startTelegramJob } from "../services/telegram.service.js";

export const createTelegramSchedules = async (req, res) => {
  try {
    console.log("[DEBUG] /api/schedules payload:", req.body);

    const userId = req.user?._id || null;

    const { chatId, schedules = [] } = req.body;
    if (!chatId) return res.status(400).json({ success: false, message: "chatId is required" });
    if (!Array.isArray(schedules) || schedules.length === 0)
      return res.status(400).json({ success: false, message: "schedules[] is required" });

    if (!bot) {
      return res.status(500).json({
        success: false,
        message: "Telegram bot is not configured on the server",
        hint: "Set TELEGRAM_BOT_TOKEN and redeploy the backend.",
      });
    }

    // Validate chatId upfront so we don't create schedules that can never send.
    try {
      await bot.sendMessage(
        chatId,
        "✅ CareSentry connected. Your medication reminders will be scheduled now."
      );
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Unable to send Telegram message to this chatId",
        detail: String(e?.message || e),
        hint: "Make sure you opened your bot in Telegram and pressed Start, then re-check your chatId.",
      });
    }

    const created = [];
    for (const s of schedules) {
      const medicine = s.medicine || "Medicine";
      const [hh, mm] = String(s.time || "").split(":").map(n => parseInt(n, 10));
      if (Number.isNaN(hh) || Number.isNaN(mm)) {
        return res.status(400).json({ success: false, message: `Invalid time for ${medicine}` });
      }
      const duration = parseInt(s.duration, 10) || 1;

      const cronTime = `${mm} ${hh} * * *`;
      const message = `${medicine} time reminder`;

      const doc = await Schedule.create({
        user: userId,
        chatId,
        medicine,
        message,
        cronTime,
        time: s.time,          // <-- add this
        duration,              // <-- add this
        remainingRuns: duration,
        active: true,
      });

      await startTelegramJob(doc);

      // Optional: per-schedule confirmation to make debugging easy
      try {
        await bot.sendMessage(
          chatId,
          `⏰ Scheduled: ${medicine} at ${s.time} for ${duration} day(s).`
        );
      } catch {
        // ignore; job will still run
      }
      created.push(doc);
    }
    return res.json({ success: true, count: created.length, data: created });
  } catch (err) {
    console.error("[createTelegramSchedules ERROR]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
