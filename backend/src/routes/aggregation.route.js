import express from "express";
import {
  getMedicationStatistics,
  getPrescriptionDashboard,
  getPrescriptionsWithUserDetails,
  getPrescriptionsByMedicationBucket,
  getActiveScheduleStats,
  exportPrescriptionSummary,
  getPrescriptionsWithPagination,
  searchMedicationsFullText,
} from "../controllers/aggregation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All aggregation endpoints require authentication
router.use(authenticate);

/**
 * AGGREGATION PIPELINE ROUTES
 */

// Get medication usage statistics (Group, Accumulator operators)
router.get("/medications/stats", getMedicationStatistics);

// Get comprehensive prescription dashboard (Multiple pipelines with $facet)
router.get("/prescriptions/dashboard", getPrescriptionDashboard);

// Get prescriptions with user details (Lookup - JOIN operation)
router.get("/prescriptions/with-user", getPrescriptionsWithUserDetails);

// Categorize prescriptions by medication count ($bucket operator)
router.get(
  "/prescriptions/by-medication-bucket",
  getPrescriptionsByMedicationBucket
);

// Get active schedule statistics (Group, aggregation)
router.get("/schedules/stats", getActiveScheduleStats);

// Export prescription summary (Output operations - $out)
router.post("/prescriptions/export-summary", exportPrescriptionSummary);

// Get prescriptions with pagination ($facet for metadata)
router.get("/prescriptions/paginated", getPrescriptionsWithPagination);

// Full-text search on medications ($text, $search)
router.get("/medications/search", searchMedicationsFullText);

export default router;
