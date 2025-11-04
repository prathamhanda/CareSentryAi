import { Schedule } from "../models/schedule.model.js";
import { bot } from "../services/telegram.service.js";

//Example: { chatId, items:[{ medicine, times:[HH:mm,HH:mm], durationDays },{},{}] }
const createFromPrescription = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { chatId } = req.body;

    const created = [];

    if (Array.isArray(req.body.items)) {
      for (const it of req.body.items) {
        const medName = it.medicine || "Medicine";
        const medTimes = Array.isArray(it.times) ? it.times : [];
        const runs = Number(it.durationDays) || 1;
        for (const t of medTimes) {
          const [hourStr, minuteStr] = String(t).split(":");
          const hour = Number(hourStr);
          const minute = Number(minuteStr);
          const cronTime = `${minute} ${hour} * * *`;
          const message = `${medName} time reminder`;
          const doc = await Schedule.create({
            user: userId,
            chatId,
            message,
            cronTime,
            remainingRuns: runs,
            active: true,
          });
          // do not schedule cron jobs; send immediate confirmation via Telegram
          try {
            if (bot) {
              await bot.sendMessage(chatId, `Reminder created: ${message}`);
            }
          } catch (e) {
            // ignore send errors but record them
            console.error("telegram send on create failed:", e?.message || e);
          }
          created.push(doc);
        }
      }
      return res.json({ success: true, count: created.length, data: created });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Schedule.findByIdAndDelete(id);
    res.json({
      success: true,
      message: doc ? "Schedule removed" : "Schedule not found",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const listSchedules = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await Schedule.find({ user: userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createFromPrescription, deleteSchedule, listSchedules };
