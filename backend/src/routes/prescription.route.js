import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createPrescription,
  listPrescriptions,
} from "../controllers/prescription.controller.js";

const router = Router();

router.post("/prescriptions", authenticate, createPrescription);
router.get("/prescriptions", authenticate, listPrescriptions);

export default router;
