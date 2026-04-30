import mongoose from "mongoose";

// ============================================
// AGGREGATION FRAMEWORK EXAMPLES
// ============================================

/**
 * Get comprehensive medication statistics for logged-in user
 * Topics: Aggregation Pipeline, $unwind, $group, Accumulator Operators
 */
export const getMedicationStatistics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await mongoose.model("Prescription").aggregate([
      // Stage 1: Match only this user's prescriptions
      {
        $match: { user: userId },
      },
      // Stage 2: Unwind medications array to process each medication separately
      {
        $unwind: "$medications",
      },
      // Stage 3: Group by medication name and calculate statistics
      {
        $group: {
          _id: "$medications.name", // Group by medication name
          totalOccurrences: { $sum: 1 }, // Count occurrences - $sum
          averageDosage: { $avg: { $toInt: "$medications.dosage" } }, // $avg
          uniqueFrequencies: { $addToSet: "$medications.frequency" }, // $addToSet
          prescriptionIds: { $push: "$_id" }, // $push accumulator
          lastUsed: { $max: "$updatedAt" }, // $max
          firstUsed: { $min: "$createdAt" }, // $min
        },
      },
      // Stage 4: Sort by total occurrences descending
      {
        $sort: { totalOccurrences: -1 },
      },
    ]);

    res.json({
      status: 200,
      message: "Medication statistics retrieved",
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve medication statistics",
      error: err.message,
    });
  }
};

/**
 * Get prescription dashboard with multiple facets
 * Topics: $facet, Multiple aggregation pipelines, Data grouping
 */
export const getPrescriptionDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const dashboard = await mongoose.model("Prescription").aggregate([
      {
        $match: { user: userId },
      },
      // $facet: Run multiple aggregation pipelines in parallel
      {
        $facet: {
          // Pipeline 1: Prescription status distribution
          statusSummary: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 },
            },
          ],

          // Pipeline 2: Most common medications
          topMedications: [
            {
              $unwind: "$medications",
            },
            {
              $group: {
                _id: "$medications.name",
                frequency: { $sum: 1 },
              },
            },
            {
              $sort: { frequency: -1 },
            },
            {
              $limit: 5,
            },
          ],

          // Pipeline 3: Recent prescriptions
          recentPrescriptions: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 3,
            },
            {
              $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                medicationCount: { $size: "$medications" },
              },
            },
          ],

          // Pipeline 4: Total and average metrics
          metrics: [
            {
              $group: {
                _id: null,
                totalPrescriptions: { $sum: 1 },
                totalMedications: {
                  $sum: { $size: "$medications" },
                },
                averageMeds: {
                  $avg: { $size: "$medications" },
                },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      status: 200,
      message: "Dashboard data retrieved",
      data: dashboard[0], // facet returns array with single object
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve dashboard",
      error: err.message,
    });
  }
};

/**
 * Get prescriptions with full user details using $lookup
 * Topics: $lookup (JOIN operation), Relationship handling
 */
export const getPrescriptionsWithUserDetails = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const prescriptions = await mongoose.model("Prescription").aggregate([
      {
        $match: { user: userId },
      },
      // Stage 2: Lookup user details from Users collection
      {
        $lookup: {
          from: "users", // Collection to join with
          localField: "user", // Field in Prescription
          foreignField: "_id", // Field in User
          as: "userDetails", // Output field name
        },
      },
      // Stage 3: Convert userDetails array to single object
      {
        $unwind: "$userDetails",
      },
      // Stage 4: Project only needed fields
      {
        $project: {
          _id: 1,
          medications: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "userDetails.username": 1,
          "userDetails.email": 1,
          "userDetails.phone": 1,
        },
      },
      // Stage 5: Sort by creation date
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({
      status: 200,
      message: "Prescriptions with user details retrieved",
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
 * Categorize prescriptions by medication count using $bucket
 * Topics: $bucket, Data categorization, $addFields
 */
export const getPrescriptionsByMedicationBucket = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const buckets = await mongoose.model("Prescription").aggregate([
      {
        $match: { user: userId },
      },
      // Add a calculated field for medication count
      {
        $addFields: {
          medicationCount: { $size: "$medications" },
        },
      },
      // Categorize into buckets
      {
        $bucket: {
          groupBy: "$medicationCount", // Field to bucket on
          boundaries: [0, 1, 3, 5, 10], // Bucket boundaries
          default: "10+", // Category for values >= 10
          output: {
            count: { $sum: 1 },
            prescriptions: { $push: "$_id" },
            totalMeds: { $sum: "$medicationCount" },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      status: 200,
      message: "Prescriptions categorized by medication count",
      data: buckets,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve buckets",
      error: err.message,
    });
  }
};

/**
 * Get active schedules with aggregated statistics
 * Topics: $match, $group, Aggregation with referenced collections
 */
export const getActiveScheduleStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await mongoose.model("Schedule").aggregate([
      // Stage 1: Filter only active schedules
      {
        $match: { user: userId, active: true },
      },
      // Stage 2: Group by medicine and aggregate
      {
        $group: {
          _id: "$medicine",
          count: { $sum: 1 },
          totalRemainingRuns: { $sum: "$remainingRuns" },
          avgRemainingRuns: { $avg: "$remainingRuns" },
          scheduleTimes: { $push: "$time" },
          createdAtList: { $push: "$createdAt" },
        },
      },
      // Stage 3: Sort by count descending
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      status: 200,
      message: "Active schedule statistics retrieved",
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve schedule statistics",
      error: err.message,
    });
  }
};

/**
 * Export prescription summary to a new collection
 * Topics: $out stage, Data persistence, Aggregation output
 */
export const exportPrescriptionSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Note: This modifies the database by creating a new collection
    const result = await mongoose.model("Prescription").aggregate([
      {
        $match: { user: userId },
      },
      // Project summary data
      {
        $project: {
          _id: 1,
          user: 1,
          status: 1,
          medicationCount: { $size: "$medications" },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      // Output to a collection (persists the aggregation result)
      {
        $out: `prescription_summary_${userId}`,
      },
    ]);

    res.json({
      status: 200,
      message: `Prescription summary exported to collection: prescription_summary_${userId}`,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to export prescription summary",
      error: err.message,
    });
  }
};

/**
 * Complex pipeline with multiple stages: match, sort, limit, skip
 * Topics: Pagination with aggregation, $skip, $limit
 */
export const getPrescriptionsWithPagination = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const prescriptions = await mongoose.model("Prescription").aggregate([
      {
        $match: { user: userId },
      },
      // Stage 2: Sort
      {
        $sort: { createdAt: -1 },
      },
      // Stage 3: Get total count (for pagination info)
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const total = prescriptions[0].metadata[0]?.total || 0;
    const data = prescriptions[0].data;

    res.json({
      status: 200,
      message: "Prescriptions retrieved with pagination",
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve paginated prescriptions",
      error: err.message,
    });
  }
};

/**
 * Full-text search aggregation
 * Topics: Text indexes, $match with $text, $search operator
 * Note: Requires text index on medications fields
 */
export const searchMedicationsFullText = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Search term is required",
        });
    }

    const results = await mongoose.model("Prescription").aggregate([
      {
        $match: {
          user: userId,
          // Text search operator
          $text: { $search: searchTerm },
        },
      },
      // Add relevance score
      {
        $addFields: {
          score: { $meta: "textScore" },
        },
      },
      // Sort by relevance
      {
        $sort: { score: { $meta: "textScore" } },
      },
      {
        $limit: 20,
      },
    ]);

    res.json({
      status: 200,
      message: `Found ${results.length} results for "${searchTerm}"`,
      data: results,
    });
  } catch (err) {
    if (err.message.includes("no text index")) {
      return res.status(400).json({
        status: 400,
        message:
          "Text index not created. Create index on 'medications.name' and 'medications.instructions'",
      });
    }

    res.status(500).json({
      status: 500,
      message: "Search failed",
      error: err.message,
    });
  }
};
