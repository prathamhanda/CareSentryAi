import cron from "node-cron";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import { Schedule } from "../models/schedule.model.js";

const { Client, LocalAuth } = pkg;
const jobs = {};
let client;

const whatsappSetup = () => {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("Scan QR code to connect WhatsApp");
  });

  client.on("ready", async () => {
    console.log("WhatsApp ready");
    await loadAllSchedules();
  });

  client.initialize();
  return client;
};

const loadAllSchedules = async () => {
  const schedules = await Schedule.find({ active: true });
  schedules.forEach(scheduleMessage);
  console.log(`Loaded ${schedules.length} active schedules`);
};

// Note: schedules now store `chatId` directly (e.g. "919876543210@c.us").
// The schedule creator must provide a valid chatId. We no longer resolve phone numbers here.

const scheduleMessage = (doc) => {
  const id = String(doc._id);

  const job = cron.schedule(doc.cronTime, async () => {
    try {
      const chatId = doc.chatId;
      if (!chatId) {
        console.log(`Skipped: missing chatId for schedule ${id}`);
        return;
      }

      await client.sendMessage(chatId, doc.message);
      console.log(`Sent to ${chatId}`);

      const updatedSchedule = await Schedule.findById(doc._id);
      updatedSchedule.remainingRuns--;
      await updatedSchedule.save();

      if (updatedSchedule.remainingRuns === 0) {
        updatedSchedule.active = false;
        await updatedSchedule.save();
        if (jobs[id]) {
          jobs[id].stop();
          delete jobs[id];
        }
      }
    } catch (err) {
      console.error("Send failed:", err.message);
    }
  });

  jobs[id] = job;
  console.log(`Scheduled job for ${id} at cron: ${doc.cronTime}`);
};

const cancelScheduleById = async (id) => {
  if (jobs[id]) {
    jobs[id].stop();
    delete jobs[id];
  }
};

export { whatsappSetup, scheduleMessage, loadAllSchedules, cancelScheduleById };
