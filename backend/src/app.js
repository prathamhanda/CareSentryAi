import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import scheduleRouter from "./routes/schedule.route.js";
import prescriptionRouter from "./routes/prescription.route.js";
import predictRouter from "./routes/predict.route.js";
import debugRouter from "./routes/debug.route.js";

const app = express();

const corsOriginRaw =
  process.env.CORS_ORIGIN || "https://care-sentry-ai.vercel.app";
const corsOrigin = corsOriginRaw.includes(",")
  ? corsOriginRaw.split(",").map((s) => s.trim())
  : corsOriginRaw;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true,
  })
);
app.use(express.static("public"));
app.use(cookieParser());

// mount routes
app.use("/api/users", userRouter);
app.use("/api", scheduleRouter);
app.use("/api", prescriptionRouter);
app.use("/api", predictRouter);
app.use("/api/debug", debugRouter);

// healthcheck (Render + external monitors)
app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    service: "backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// convenient alias under /api as well
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    service: "backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("HOMEPAGE");
});

export { app };
