import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createPrescription,
  listPrescriptions,
  deletePrescription,
  updatePrescription,
} from "../controllers/prescription.controller.js";

const router = Router();

router.post("/prescriptions", authenticate, createPrescription);
router.get("/prescriptions", authenticate, listPrescriptions);
router.delete("/prescriptions/:id", authenticate, deletePrescription);
router.put("/prescriptions/:id", authenticate, updatePrescription);


export default router;
