# MongoDB Implementation Architecture

## Project Structure Overview

```
CareSentryAi/
├── backend/
│   └── src/
│       ├── models/
│       │   ├── user.model.js                    ← Indexes: username, email
│       │   ├── prescription.model.js            ← Indexes: 7 (single, compound, text, multikey)
│       │   └── schedule.model.js                ← Indexes: 6 (single, compound)
│       │
│       ├── controllers/
│       │   ├── user.controller.js               ← CRUD: register, login, getCurrentUser
│       │   ├── prescription.controller.js       ← CRUD: create, list, update, delete
│       │   ├── schedule.controller.js           ← CRUD: create, delete, list
│       │   ├── aggregation.controller.js        ← 8 Aggregation examples ✨
│       │   └── advanced-queries.controller.js   ← 30+ Query examples ✨
│       │
│       ├── routes/
│       │   ├── user.route.js                    ← Auth routes
│       │   ├── prescription.route.js            ← CRUD routes
│       │   ├── schedule.route.js                ← Schedule routes
│       │   ├── aggregation.route.js             ← Aggregation endpoints ✨
│       │   └── advanced-queries.route.js        ← Query endpoints ✨
│       │
│       ├── app.js                               ← Express setup, route mounting
│       ├── index.js                             ← Server startup
│       └── db/
│           └── mongodb.js                       ← Connection setup, pooling
│
├── MONGODB_EVALUATION_ANALYSIS.md               ← Deep analysis (1000+ lines)
├── IMPLEMENTATION_GUIDE.md                      ← Testing guide with curl examples
├── SYLLABUS_MAPPING.md                          ← Syllabus-to-code mapping
├── ENDPOINTS_REFERENCE.md                       ← Quick endpoint reference
├── README_EVALUATION.md                         ← Executive summary
└── test_mongodb_concepts.sh                     ← Automated testing script
```

---

## Data Model & Collections Hierarchy

```
MongoDB (medicreminder)
│
├── Collections
│   │
│   ├── users
│   │   ├── _id (ObjectId)
│   │   ├── username (indexed - unique)
│   │   ├── email (indexed)
│   │   ├── phone
│   │   ├── password (hashed)
│   │   ├── avatar
│   │   ├── createdAt (timestamp)
│   │   └── updatedAt (timestamp)
│   │
│   ├── prescriptions
│   │   ├── _id (ObjectId)
│   │   ├── user (ObjectId - ref to users, indexed)
│   │   ├── medications (array of embedded docs) ← EMBEDDED DOCUMENTS
│   │   │   ├── name (indexed via multikey)
│   │   │   ├── dosage
│   │   │   ├── frequency (indexed via multikey)
│   │   │   ├── duration
│   │   │   └── instructions (text indexed)
│   │   ├── status (indexed: Active/Completed/Expired)
│   │   ├── createdAt
│   │   └── updatedAt
│   │
│   └── schedules
│       ├── _id (ObjectId)
│       ├── user (ObjectId - ref to users, indexed)
│       ├── chatId (indexed - for Telegram)
│       ├── medicine (indexed)
│       ├── time
│       ├── duration
│       ├── message
│       ├── cronTime
│       ├── remainingRuns
│       ├── active (indexed)
│       ├── createdAt
│       └── updatedAt
│
└── Indexes (Total: 16)
    ├── users
    │   ├── _id (default)
    │   ├── username_1 (unique)
    │   ├── email_1
    │   └── username_1_createdAt_-1 (compound)
    │
    ├── prescriptions
    │   ├── _id (default)
    │   ├── user_1
    │   ├── status_1
    │   ├── user_1_status_1 (compound)
    │   ├── user_1_createdAt_-1 (compound)
    │   ├── medications.name_1 (multikey)
    │   ├── medications.frequency_1 (multikey)
    │   └── medications.name_text_instructions_text (text)
    │
    └── schedules
        ├── _id (default)
        ├── user_1
        ├── chatId_1
        ├── active_1
        ├── user_1_active_1 (compound)
        ├── user_1_createdAt_-1 (compound)
        └── medicine_1_active_1 (compound)
```

---

## CRUD Operations Flow

```
┌─────────────────────────────────────────────────────┐
│                 CRUD OPERATIONS                      │
└─────────────────────────────────────────────────────┘

CREATE (Insert)
├── User Registration
│   └── POST /api/users/register
│       └── User.create({ username, email, phone, password })
│           └── Returns: User with _id generated
│
├── Prescription
│   └── POST /api/prescriptions
│       └── Prescription.create({ user, medications, status })
│           └── Returns: Prescription with embedded medications
│
└── Schedule
    └── POST /api/schedules
        └── Schedule.create({ user, chatId, medicine, time, ... })
            └── Returns: Schedule document

READ (Query)
├── User
│   └── GET /api/users/me
│       └── User.findById(req.user._id)
│           └── Returns: Current user
│
├── Prescriptions
│   └── GET /api/prescriptions
│       └── Prescription.find({ user: userId })
│           └── Returns: Array of prescriptions
│
└── Specific with Operators
    ├── GET /api/queries/prescriptions/by-date?fromDate=...&toDate=...
    │   └── find({ createdAt: { $gte, $lte } })
    │
    ├── GET /api/queries/prescriptions/by-status-multiple?statuses=...
    │   └── find({ status: { $in: [...] } })
    │
    └── GET /api/queries/users/without-avatar
        └── find({ avatar: { $exists: false } })

UPDATE (Modify)
├── Replace/Update
│   └── PATCH /api/prescriptions/{id}
│       └── Prescription.findOneAndUpdate({_id, user}, {medications}, {new: true})
│           └── Returns: Updated document
│
├── Array Operations
│   ├── POST /api/queries/prescriptions/{id}/add-medication
│   │   └── findOneAndUpdate({}, { $push: { medications: {...} } })
│   │
│   ├── PATCH /api/queries/prescriptions/{id}/remove-last-medication
│   │   └── findOneAndUpdate({}, { $pop: { medications: 1 } })
│   │
│   └── PATCH /api/queries/prescriptions/remove-by-name
│       └── updateMany({}, { $pull: { medications: { name } } })
│
└── Field Updates
    ├── PATCH /api/queries/users/avatar
    │   └── findOneAndUpdate({}, { $set: { avatar: url } })
    │
    └── PATCH /api/queries/schedules/{id}/increment-reminder
        └── findOneAndUpdate({}, { $inc: { remainingRuns: -1 } })

DELETE (Remove)
├── Single
│   └── DELETE /api/prescriptions/{id}
│       └── Prescription.findOneAndDelete({ _id: id, user: userId })
│           └── Returns: Deleted document
│
└── Multiple
    └── DELETE /api/schedules/{id}
        └── Schedule.findByIdAndDelete(id)
            └── Returns: Deleted document
```

---

## Query Operators Implementation Map

```
┌──────────────────────────────────────────────────────────┐
│              QUERY OPERATORS (30+)                        │
└──────────────────────────────────────────────────────────┘

COMPARISON OPERATORS
├── $gt  (Greater Than)          → Schedules with remainingRuns > x
├── $gte (Greater or Equal)      → Dates >= fromDate
├── $lt  (Less Than)             → Dates < someDate
├── $lte (Less or Equal)         → Dates <= toDate
├── $eq  (Equal)                 → Status = "Active"
├── $ne  (Not Equal)             → Status != "Expired"
├── $in  (In Array)              → Status in [Active, Completed]
└── $nin (Not in Array)          → Medicine not in [Aspirin, ...]

LOGICAL OPERATORS
├── $and (AND)                   → Multiple conditions must be true
├── $or  (OR)                    → Any condition true
├── $nor (NOR)                   → None of conditions true
└── $not (NOT)                   → Negate a condition

ELEMENT OPERATORS
├── $exists (Field Exists)       → avatar field exists?
├── $type   (Type Check)         → medications is array?

ARRAY OPERATORS (Query)
├── $all       (All in array)    → Contains medication1 AND medication2
├── $elemMatch (Element Match)   → Any element matches all conditions
└── $size      (Array Size)      → medications array length = 3

ARRAY OPERATORS (Update)
├── $push      (Add to array)    → Append medication
├── $pushEach  ($push + $each)   → Append multiple
├── $addToSet  (Add if unique)   → Add without duplicates
├── $pop       (Remove end)      → Remove last element
├── $pull      (Remove matching) → Remove all matching elements
└── $pullAll   (Remove values)   → Remove specific values

FIELD OPERATORS (Update)
├── $set       (Set value)       → avatar = newUrl
├── $unset     (Remove field)    → Remove password field
├── $inc       (Increment)       → Count += 1
├── $mul       (Multiply)        → Price *= factor
├── $rename    (Rename field)    → oldName → newName
├── $min       (Update if less)  → Keep minimum value
├── $max       (Update if more)  → Keep maximum value
└── $currentDate (Set timestamp) → Set to current time

SPECIAL OPERATORS
├── $regex     (Pattern match)   → Search high dosage meds
└── $text      (Full-text)       → Search medications text
```

---

## Aggregation Pipeline Architecture

```
┌──────────────────────────────────────────────────────────┐
│          AGGREGATION FRAMEWORK (8 Endpoints)              │
└──────────────────────────────────────────────────────────┘

ENDPOINT 1: Medication Statistics
Input: User ID
Steps:
  1. $match: Filter user's prescriptions
  2. $unwind: Break apart medications array
  3. $group: Group by med name, sum counts, add frequencies
  4. $sort: By count descending
Output: [{ _id: "Aspirin", count: 5, frequencies: [...] }, ...]

ENDPOINT 2: Prescription Dashboard ($facet)
Input: User ID
Steps:
  1. $match: User's prescriptions
  2. $facet: Run 4 pipelines in parallel
     ├── statusSummary: count by status
     ├── topMedications: top 5 medications
     ├── recentPrescriptions: last 3
     └── metrics: totals and averages
Output: { statusSummary, topMedications, recentPrescriptions, metrics }

ENDPOINT 3: Prescriptions with User Details ($lookup)
Input: User ID
Steps:
  1. $match: User's prescriptions
  2. $lookup: JOIN with users collection
  3. $unwind: Unwrap user array
  4. $project: Select fields
Output: Prescriptions enriched with user info

ENDPOINT 4: Prescriptions by Medication Bucket ($bucket)
Input: User ID
Steps:
  1. $match: User's prescriptions
  2. $addFields: Calculate medication count
  3. $bucket: Categorize by count (0-1, 1-3, 3-5, 5-10, 10+)
Output: { _id: "1-3", count: 2, prescriptions: [...] }

ENDPOINT 5: Active Schedules Statistics
Input: User ID
Steps:
  1. $match: Active schedules for user
  2. $group: By medicine, sum remaining runs, push times
Output: [{ _id: "Aspirin", count: 3, totalRemainingRuns: 15 }, ...]

ENDPOINT 6: Export to Collection ($out)
Input: User ID
Steps:
  1. $match: User's prescriptions
  2. $project: Select summary fields
  3. $out: Write to new collection
Output: New collection created with summary data

ENDPOINT 7: Paginated Results ($facet for pagination)
Input: page, limit
Steps:
  1. $match: User's prescriptions
  2. $sort: By date
  3. $facet: Get metadata and paginated data
     ├── metadata: [{ $count: "total" }]
     └── data: [$skip: offset, $limit: pageSize]
Output: { data: [...], pagination: { currentPage, totalPages } }

ENDPOINT 8: Full-Text Search ($text)
Input: searchTerm
Steps:
  1. $match: $text: { $search: term }
  2. $addFields: Score by relevance
  3. $sort: By text score
Output: [{ _id: ..., score: 0.95 }, ...]
```

---

## Indexing Strategy

```
┌──────────────────────────────────────────────────────────┐
│           INDEXING FOR PERFORMANCE                        │
└──────────────────────────────────────────────────────────┘

USER COLLECTION (3 indexes)
├── Index 1: username (unique)
│   Purpose: Fast unique constraint, login queries
│   Usage: db.users.findOne({ username: "john" })
│
├── Index 2: email (single field)
│   Purpose: Fast email lookups
│   Usage: db.users.findOne({ email: "..." })
│
└── Index 3: username + createdAt (compound)
    Purpose: Sort users by registration date
    Usage: db.users.find({ username }).sort({ createdAt: -1 })

PRESCRIPTION COLLECTION (7 indexes)
├── Index 1: user (single field)
│   Purpose: Find all user's prescriptions
│   Usage: find({ user: userId })
│
├── Index 2: status (single field)
│   Purpose: Find by prescription status
│   Usage: find({ status: "Active" })
│
├── Index 3: user + status (compound)
│   Purpose: User's active prescriptions
│   Usage: find({ user: userId, status: "Active" })
│
├── Index 4: user + createdAt (compound)
│   Purpose: Recent prescriptions for user
│   Usage: find({ user: userId }).sort({ createdAt: -1 })
│
├── Index 5: medications.name (multikey)
│   Purpose: Search medication names
│   Usage: find({ "medications.name": "Aspirin" })
│
├── Index 6: medications.frequency (multikey)
│   Purpose: Find by medication frequency
│   Usage: find({ "medications.frequency": "daily" })
│
└── Index 7: medications.name + instructions (text)
    Purpose: Full-text search on medications
    Usage: find({ $text: { $search: "aspirin pain" } })

SCHEDULE COLLECTION (6 indexes)
├── Index 1: user (single field)
│   Purpose: Find user's schedules
│   Usage: find({ user: userId })
│
├── Index 2: chatId (single field)
│   Purpose: Telegram lookups
│   Usage: find({ chatId: "12345" })
│
├── Index 3: active (single field)
│   Purpose: Find active schedules
│   Usage: find({ active: true })
│
├── Index 4: user + active (compound)
│   Purpose: User's active schedules
│   Usage: find({ user: userId, active: true })
│
├── Index 5: user + createdAt (compound)
│   Purpose: Recent schedules
│   Usage: find({ user: userId }).sort({ createdAt: -1 })
│
└── Index 6: medicine + active (compound)
    Purpose: Active schedules by medicine
    Usage: find({ medicine: "Aspirin", active: true })
```

---

## Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────┐
│         AUTHENTICATION FLOW                               │
└──────────────────────────────────────────────────────────┘

LOGIN FLOW:
1. POST /api/users/login { username, password }
2. User.findOne({ username })  ← Uses indexed username
3. bcrypt.compare(password, hash)
4. jwt.sign(payload) with secret
5. Set HttpOnly Cookie with token
6. Return sanitized user (password removed)

PROTECTED ROUTES:
1. GET /api/prescriptions (requires auth)
2. verifyJWT middleware extracts token from cookie
3. jwt.verify(token, secret)
4. req.user._id populated
5. Queries filtered by: { user: req.user._id }
6. 403 Unauthorized if no valid token

NOTE: All aggregation and query endpoints require authentication
      This ensures users only see their own data
```

---

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────┐
│        INDEX IMPACT ON PERFORMANCE                        │
└──────────────────────────────────────────────────────────┘

QUERIES WITHOUT INDEX
└─ O(n): Full collection scan
   Example: find({ "medications.name": "Aspirin" })
   Time: Scans every document

QUERIES WITH SINGLE FIELD INDEX
└─ O(log n): B-tree index lookup
   Example: find({ user: userId })  ← user is indexed
   Time: 10x-100x faster

QUERIES WITH COMPOUND INDEX
└─ O(log n): B-tree with multiple fields
   Example: find({ user, status })  ← compound index
   Time: Eliminates sort stage

COVERED QUERIES (Index only, no docs fetch)
└─ O(log n): Data in index, no document lookup
   Requires: All query and projection fields in index
   Time: Fastest possible

TEXT SEARCH
└─ O(log n): Inverted index lookups
   Example: find({ $text: { $search: "pain" } })
   Time: Fast multi-word search

AGGREGATION PIPELINE
├─ $match: Uses indexes if possible (O(log n))
├─ $group: O(n) - must examine all docs
├─ $sort: O(n log n) - may use index or external sort
└─ $lookup: O(n) per document - joins are expensive
```

---

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `aggregation.controller.js` | 300+ | 8 aggregation pipeline examples |
| `advanced-queries.controller.js` | 600+ | 30+ query operation examples |
| `aggregation.route.js` | 50 | Aggregation endpoints |
| `advanced-queries.route.js` | 150 | Query operation endpoints |
| `user.model.js` | 40 | User schema with indexes |
| `prescription.model.js` | 55 | Prescription & embedded meds with 7 indexes |
| `schedule.model.js` | 50 | Schedule schema with 6 indexes |
| `app.js` | 50 | Express with new routes registered |
| **Documentation** | **5000+** | Complete analysis and guides |

---

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│           PRODUCTION DEPLOYMENT                          │
└─────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT
├── MongoDB: localhost:27017
├── Node Server: localhost:3000
└── Frontend: localhost:5173

PRODUCTION (MongoDB Atlas)
├── MongoDB URL: mongodb+srv://user:pass@cluster.mongodb.net/medicreminder
├── Replica Set: 3+ nodes automatic
├── Replication: High availability (failover < 10s)
├── Backup: Automatic snapshots
├── Monitoring: Built-in metrics
├── Security: Network access lists, auth
└── Scaling: Sharding ready with compound keys

SCALING STRATEGY
├── Vertical: Increase server resources
├── Horizontal: Sharding by user ID
│   └── Shard Key: { user: 1, createdAt: -1 }
│   └── Ensures user data stays together
```

---

This comprehensive architecture demonstrates advanced MongoDB usage across all major topics! 🎯
