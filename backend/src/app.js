import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import scheduleRouter from "./routes/schedule.route.js";
import prescriptionRouter from "./routes/prescription.route.js";
import predictRouter from "./routes/predict.route.js";
import debugRouter from "./routes/debug.route.js";

const app = express();

app.use(cors({
origin: "https://medic-reminder-two.vercel.app",
credentials: true
}));

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

app.get("/", (req, res) => {
  res.send("HOMEPAGE");
});

export { app };
