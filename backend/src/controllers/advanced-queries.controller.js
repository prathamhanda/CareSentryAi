import { Prescription } from "../models/prescription.model.js";
import { Schedule } from "../models/schedule.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// ============================================
// ADVANCED QUERY OPERATIONS
// ============================================

/**
 * QUERY OPERATORS: Comparison Operators
 * Topics: $gt, $gte, $lt, $lte, $eq, $ne, $in, $nin
 */

/**
 * Find schedules with remaining runs greater than a threshold
 * Topics: $gt (greater than) operator
 */
export const getSchedulesWithRemainingRuns = async (req, res) => {
  try {
    const userId = req.user._id;
    const { minimumRuns = 1 } = req.query;

    const schedules = await Schedule.find({
      user: userId,
      remainingRuns: { $gt: parseInt(minimumRuns) }, // Greater than
      active: true,
    }).sort({ remainingRuns: -1 });

    res.json({
      status: 200,
      message: `Found ${schedules.length} schedules with > ${minimumRuns} remaining runs`,
      data: schedules,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve schedules",
      error: err.message,
    });
  }
};

/**
 * Find prescriptions created within a date range
 * Topics: $gte (>=), $lte (<=) operators
 */
export const getPrescriptionsByDateRange = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "fromDate and toDate are required (ISO format)",
        });
    }

    const prescriptions = await Prescription.find({
      user: userId,
      createdAt: {
        $gte: new Date(fromDate), // Greater than or equal
        $lte: new Date(toDate), // Less than or equal
      },
    }).sort({ createdAt: -1 });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions in date range`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve prescriptions",
      error: err.message,
    });
  }
};

/**
 * Find prescriptions with specific status (array of values)
 * Topics: $in operator
 */
export const getPrescriptionsByMultipleStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { statuses = "Active,Completed" } = req.query;

    const statusArray = statuses
      .split(",")
      .map((s) => s.trim())
      .filter((s) => ["Active", "Completed", "Expired"].includes(s));

    const prescriptions = await Prescription.find({
      user: userId,
      status: { $in: statusArray }, // Match ANY of these statuses
    }).sort({ createdAt: -1 });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions with matching statuses`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve prescriptions",
      error: err.message,
    });
  }
};

/**
 * Find schedules that are NOT in a specific set
 * Topics: $nin (not in) operator
 */
export const getSchedulesExcludingMedicines = async (req, res) => {
  try {
    const userId = req.user._id;
    const { excludeMedicines = "Aspirin" } = req.query;

    const medicineArray = excludeMedicines
      .split(",")
      .map((m) => m.trim());

    const schedules = await Schedule.find({
      user: userId,
      medicine: { $nin: medicineArray }, // Exclude these medicines
      active: true,
    });

    res.json({
      status: 200,
      message: `Found ${schedules.length} schedules excluding specified medicines`,
      data: schedules,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve schedules",
      error: err.message,
    });
  }
};

/**
 * LOGICAL OPERATORS
 * Topics: $and, $or, $not, $nor
 */

/**
 * Find prescriptions: Active OR Completed AND modified last week
 * Topics: $or, $and operators
 */
export const getRecentActiveOrCompletedPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const prescriptions = await Prescription.find({
      $and: [
        { user: userId },
        {
          $or: [
            { status: "Active" },
            { status: "Completed" },
          ],
        },
        { updatedAt: { $gte: lastWeek } },
      ],
    }).sort({ updatedAt: -1 });

    res.json({
      status: 200,
      message: "Recent active/completed prescriptions retrieved",
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve prescriptions",
      error: err.message,
    });
  }
};

/**
 * ELEMENT OPERATORS
 * Topics: $exists, $type operators
 */

/**
 * Find users who have not set an avatar
 * Topics: $exists operator
 */
export const getUsersWithoutAvatar = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { avatar: { $exists: false } }, // Field doesn't exist
        { avatar: "" }, // Empty string
      ],
    }).select("-password");

    res.json({
      status: 200,
      message: `Found ${users.length} users without avatar`,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve users",
      error: err.message,
    });
  }
};

/**
 * Find prescriptions where medications field has unexpected type
 * Topics: $type operator
 */
export const validatePrescriptionStructure = async (req, res) => {
  try {
    const userId = req.user._id;

    // Should be array type, flag if not
    const invalidPrescriptions = await Prescription.find({
      user: userId,
      medications: { $type: "object" }, // Wrong type (should be array)
    });

    res.json({
      status: 200,
      message: `Found ${invalidPrescriptions.length} prescriptions with invalid structure`,
      data: invalidPrescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to validate prescriptions",
      error: err.message,
    });
  }
};

// ============================================
// ARRAY OPERATIONS
// ============================================

/**
 * ARRAY QUERY OPERATORS
 * Topics: $all, $elemMatch, $size
 */

/**
 * Find prescriptions containing ALL specified medication names
 * Topics: $all operator
 */
export const findPrescriptionsByMultipleMeds = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medications = "Aspirin" } = req.query;

    const medArray = medications
      .split(",")
      .map((m) => m.trim());

    const prescriptions = await Prescription.find({
      user: userId,
      "medications.name": { $all: medArray }, // Contains ALL these meds
    });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions with all specified medications`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve prescriptions",
      error: err.message,
    });
  }
};

/**
 * Find prescriptions where a medication matches multiple conditions
 * Topics: $elemMatch operator
 */
export const findMedicationByNameAndFreq = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, frequency } = req.query;

    if (!name || !frequency) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Both name and frequency are required",
        });
    }

    const prescriptions = await Prescription.find({
      user: userId,
      medications: {
        // $elemMatch: matches array elements based on multiple conditions
        $elemMatch: {
          name: new RegExp(name, "i"),
          frequency: frequency,
        },
      },
    });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions matching criteria`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve prescriptions",
      error: err.message,
    });
  }
};

/**
 * Find prescriptions with specific medication count
 * Topics: $size operator
 */
export const getPrescriptionsByMedicationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { count = 1 } = req.query;

    const prescriptions = await Prescription.find({
      user: userId,
      medications: { $size: parseInt(count) }, // Array size
    });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions with ${count} medication(s)`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve prescriptions",
      error: err.message,
    });
  }
};

/**
 * ARRAY UPDATE OPERATORS
 * Topics: $push, $pop, $pull, $pullAll, $addToSet
 */

/**
 * Add a new medication to a prescription
 * Topics: $push operator
 */
export const addMedicationToPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medication } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $push: {
          medications: {
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            duration: medication.duration,
            instructions: medication.instructions,
          },
        },
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: "Medication added successfully",
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to add medication",
      error: err.message,
    });
  }
};

/**
 * Add multiple medications in bulk
 * Topics: $push with $each modifier
 */
export const addMultipleMedications = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medications } = req.body;

    if (!Array.isArray(medications)) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "medications must be an array",
        });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $push: {
          medications: {
            $each: medications, // $each: add multiple values
          },
        },
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: `${medications.length} medications added successfully`,
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to add medications",
      error: err.message,
    });
  }
};

/**
 * Add element to array only if it doesn't exist (prevents duplicates)
 * Topics: $addToSet operator
 */
export const addAllergy = async (req, res) => {
  try {
    // Note: This assumes allergies array is added to Prescription model
    const { prescriptionId } = req.params;
    const { allergen } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $addToSet: {
          allergies: allergen, // Only added if not already in array
        },
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: "Allergy added (if new)",
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to add allergy",
      error: err.message,
    });
  }
};

/**
 * Remove the last medication from prescription
 * Topics: $pop operator
 */
export const removeLastMedication = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $pop: { medications: 1 }, // 1: remove last, -1: remove first
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: "Last medication removed",
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to remove medication",
      error: err.message,
    });
  }
};

/**
 * Remove medication by name (removes ALL matching occurrences)
 * Topics: $pull operator
 */
export const removeMedicationByName = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicationName } = req.body;

    const result = await Prescription.updateMany(
      { user: userId },
      {
        $pull: {
          medications: { name: medicationName }, // Remove matching elements
        },
      }
    );

    res.json({
      status: 200,
      message: `Removed "${medicationName}" from ${result.modifiedCount} prescription(s)`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to remove medications",
      error: err.message,
    });
  }
};

/**
 * Remove multiple specific medicines from prescription
 * Topics: $pullAll operator
 */
export const removeMedicines = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medicineNames } = req.body;

    if (!Array.isArray(medicineNames)) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "medicineNames must be an array",
        });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $pullAll: {
          medications: medicineNames.map((name) => ({ name })), // Remove all matching
        },
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: `${medicineNames.length} medicines removed`,
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to remove medicines",
      error: err.message,
    });
  }
};

/**
 * UPDATE OPERATORS
 * Topics: $set, $unset, $inc, $rename, $min, $max, $currentDate
 */

/**
 * Update user avatar
 * Topics: $set operator
 */
export const updateUserAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { avatar: avatarUrl }, // Set field value
      },
      { new: true }
    ).select("-password");

    res.json({
      status: 200,
      message: "Avatar updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to update avatar",
      error: err.message,
    });
  }
};

/**
 * Increment reminder count for a schedule
 * Topics: $inc operator
 */
export const incrementScheduleReminderCount = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      {
        $inc: { remainingRuns: -1 }, // Decrement by 1
      },
      { new: true }
    );

    if (!schedule) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Schedule not found",
        });
    }

    res.json({
      status: 200,
      message: "Schedule reminder count updated",
      data: schedule,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to update schedule",
      error: err.message,
    });
  }
};

/**
 * Update prescription only if new date is more recent
 * Topics: $max operator
 */
export const updatePrescriptionIfNewer = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { newDate } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $max: { updatedAt: new Date(newDate) }, // Update only if newDate is greater
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: "Prescription timestamp updated if newer",
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to update prescription",
      error: err.message,
    });
  }
};

/**
 * Set current timestamp on prescription
 * Topics: $currentDate operator
 */
export const refreshPrescriptionTimestamp = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        $currentDate: { updatedAt: true }, // Set to current date
      },
      { new: true }
    );

    if (!prescription) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Prescription not found",
        });
    }

    res.json({
      status: 200,
      message: "Prescription timestamp refreshed",
      data: prescription,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to refresh timestamp",
      error: err.message,
    });
  }
};

/**
 * BULK OPERATIONS
 */

/**
 * Bulk create multiple prescriptions
 * Topics: Bulk operations, insertMany
 */
export const bulkCreatePrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prescriptions } = req.body;

    if (!Array.isArray(prescriptions)) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "prescriptions must be an array",
        });
    }

    const prescriptionsToCreate = prescriptions.map((p) => ({
      user: userId,
      medications: p.medications || [],
      status: p.status || "Active",
    }));

    const result = await Prescription.insertMany(prescriptionsToCreate);

    res.json({
      status: 201,
      message: `${result.length} prescriptions created successfully`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to bulk create prescriptions",
      error: err.message,
    });
  }
};

/**
 * NESTED DOCUMENT QUERIES with DOT NOTATION
 */

/**
 * Search medications by name using dot notation
 * Topics: Dot notation queries, nested field search
 */
export const searchMedicationByName = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicationName } = req.query;

    if (!medicationName) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "medicationName is required",
        });
    }

    const prescriptions = await Prescription.find({
      "medications.name": new RegExp(medicationName, "i"), // Dot notation for nested field
      user: userId,
    });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions with medication "${medicationName}"`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to search medications",
      error: err.message,
    });
  }
};

/**
 * Find medications with high dosage
 * Topics: Dot notation, regex search
 */
export const findHighDosageMeds = async (req, res) => {
  try {
    const userId = req.user._id;

    const prescriptions = await Prescription.find({
      "medications.dosage": {
        $regex: "high|strong|maximum|[5-9]00mg|1000mg", // Pattern matching
        $options: "i", // Case insensitive
      },
      user: userId,
    });

    res.json({
      status: 200,
      message: `Found ${prescriptions.length} prescriptions with high dosage medications`,
      data: prescriptions,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to find high dosage medications",
      error: err.message,
    });
  }
};
