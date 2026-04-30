import express from "express";
import {
  // Comparison operators
  getSchedulesWithRemainingRuns,
  getPrescriptionsByDateRange,
  getPrescriptionsByMultipleStatus,
  getSchedulesExcludingMedicines,
  // Logical operators
  getRecentActiveOrCompletedPrescriptions,
  // Element operators
  getUsersWithoutAvatar,
  validatePrescriptionStructure,
  // Array query operators
  findPrescriptionsByMultipleMeds,
  findMedicationByNameAndFreq,
  getPrescriptionsByMedicationCount,
  // Array update operators
  addMedicationToPrescription,
  addMultipleMedications,
  addAllergy,
  removeLastMedication,
  removeMedicationByName,
  removeMedicines,
  // Update operators
  updateUserAvatar,
  incrementScheduleReminderCount,
  updatePrescriptionIfNewer,
  refreshPrescriptionTimestamp,
  // Bulk operations
  bulkCreatePrescriptions,
  // Nested document queries
  searchMedicationByName,
  findHighDosageMeds,
} from "../controllers/advanced-queries.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Most routes require authentication
router.use(authenticate);

// ============================================
// COMPARISON OPERATORS
// ============================================

router.get("/schedules/remaining-runs", getSchedulesWithRemainingRuns);
router.get("/prescriptions/by-date", getPrescriptionsByDateRange);
router.get(
  "/prescriptions/by-status-multiple",
  getPrescriptionsByMultipleStatus
);
router.get("/schedules/exclude-medicines", getSchedulesExcludingMedicines);

// ============================================
// LOGICAL OPERATORS
// ============================================

router.get(
  "/prescriptions/recent-active-completed",
  getRecentActiveOrCompletedPrescriptions
);

// ============================================
// ELEMENT OPERATORS
// ============================================

router.get("/users/without-avatar", getUsersWithoutAvatar);
router.get(
  "/prescriptions/validate-structure",
  validatePrescriptionStructure
);

// ============================================
// ARRAY QUERY OPERATORS
// ============================================

router.get("/prescriptions/find-by-multiple-meds", findPrescriptionsByMultipleMeds);
router.get("/prescriptions/find-by-med-freq", findMedicationByNameAndFreq);
router.get(
  "/prescriptions/by-medication-count",
  getPrescriptionsByMedicationCount
);

// ============================================
// ARRAY UPDATE OPERATORS
// ============================================

router.post("/prescriptions/:prescriptionId/add-medication", addMedicationToPrescription);
router.post("/prescriptions/:prescriptionId/add-multiple-medications", addMultipleMedications);
router.post("/prescriptions/:prescriptionId/add-allergy", addAllergy);
router.patch(
  "/prescriptions/:prescriptionId/remove-last-medication",
  removeLastMedication
);
router.patch("/prescriptions/remove-by-name", removeMedicationByName);
router.patch(
  "/prescriptions/:prescriptionId/remove-medicines",
  removeMedicines
);

// ============================================
// UPDATE OPERATORS
// ============================================

router.patch("/users/avatar", updateUserAvatar);
router.patch(
  "/schedules/:scheduleId/increment-reminder",
  incrementScheduleReminderCount
);
router.patch(
  "/prescriptions/:prescriptionId/update-if-newer",
  updatePrescriptionIfNewer
);
router.patch(
  "/prescriptions/:prescriptionId/refresh-timestamp",
  refreshPrescriptionTimestamp
);

// ============================================
// BULK OPERATIONS
// ============================================

router.post("/prescriptions/bulk-create", bulkCreatePrescriptions);

// ============================================
// NESTED DOCUMENT QUERIES
// ============================================

router.get("/medications/search-by-name", searchMedicationByName);
router.get("/medications/high-dosage", findHighDosageMeds);

export default router;
