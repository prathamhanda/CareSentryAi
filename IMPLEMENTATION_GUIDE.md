# Implementation Guide: MongoDB Topics in CareSentryAi

This document provides a quick reference for testing all the newly implemented MongoDB concepts.

---

## Quick Start

1. **Models Updated with Indexes**:
   - `backend/src/models/user.model.js` - Added indexes on username, email
   - `backend/src/models/prescription.model.js` - Added indexes on user, status, medications.name (with text index)
   - `backend/src/models/schedule.model.js` - Added indexes on user, chatId, active

2. **New Controllers Created**:
   - `backend/src/controllers/aggregation.controller.js` - 7 aggregation pipeline examples
   - `backend/src/controllers/advanced-queries.controller.js` - 30+ query and update operations

3. **New Routes Created**:
   - `backend/src/routes/aggregation.route.js` - Aggregation endpoints
   - `backend/src/routes/advanced-queries.route.js` - Query operation endpoints

4. **Updated Files**:
   - `backend/src/app.js` - Registered new routes

---

## Aggregation Framework Endpoints

All endpoints require authentication (JWT token in Cookie or Authorization header).

### 1. Get Medication Statistics
**Endpoint**: `GET /api/aggregation/medications/stats`
**Topics Covered**: `$unwind`, `$group`, Accumulator operators (`$sum`, `$addToSet`, `$max`, `$min`)
**Response**: Medication usage statistics with count, frequencies, dosages

```bash
curl -X GET http://localhost:3000/api/aggregation/medications/stats \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 2. Get Prescription Dashboard
**Endpoint**: `GET /api/aggregation/prescriptions/dashboard`
**Topics Covered**: `$facet`, Multiple parallel pipelines, `$sort`, `$limit`
**Response**: Status summary, top medications, recent prescriptions, metrics

```bash
curl -X GET http://localhost:3000/api/aggregation/prescriptions/dashboard \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 3. Get Prescriptions with User Details
**Endpoint**: `GET /api/aggregation/prescriptions/with-user`
**Topics Covered**: `$lookup` (JOIN operation), `$unwind`, `$project`
**Response**: Prescriptions enriched with user information

```bash
curl -X GET http://localhost:3000/api/aggregation/prescriptions/with-user \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 4. Get Prescriptions by Medication Bucket
**Endpoint**: `GET /api/aggregation/prescriptions/by-medication-bucket`
**Topics Covered**: `$bucket`, `$addFields`, Data categorization
**Response**: Prescriptions grouped into buckets by medication count

```bash
curl -X GET http://localhost:3000/api/aggregation/prescriptions/by-medication-bucket \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 5. Get Active Schedule Statistics
**Endpoint**: `GET /api/aggregation/schedules/stats`
**Topics Covered**: `$group`, Accumulator operators, Aggregation on arrays
**Response**: Statistics on active schedules grouped by medicine

```bash
curl -X GET http://localhost:3000/api/aggregation/schedules/stats \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 6. Export Prescription Summary
**Endpoint**: `POST /api/aggregation/prescriptions/export-summary`
**Topics Covered**: `$out` operator (output operations), Data persistence
**Response**: Confirmation of export to new collection

```bash
curl -X POST http://localhost:3000/api/aggregation/prescriptions/export-summary \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 7. Get Prescriptions with Pagination
**Endpoint**: `GET /api/aggregation/prescriptions/paginated?page=1&limit=10`
**Topics Covered**: `$facet` for pagination, `$skip`, `$limit`
**Response**: Paginated prescriptions with metadata

```bash
curl -X GET "http://localhost:3000/api/aggregation/prescriptions/paginated?page=1&limit=10" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 8. Full-Text Search
**Endpoint**: `GET /api/aggregation/medications/search?searchTerm=aspirin`
**Topics Covered**: Text indexes, `$text` operator, `$search`
**Response**: Full-text search results with relevance score

```bash
curl -X GET "http://localhost:3000/api/aggregation/medications/search?searchTerm=aspirin" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

---

## Advanced Query Operations Endpoints

### COMPARISON OPERATORS

#### 1. Get Schedules with Remaining Runs (>)
**Endpoint**: `GET /api/queries/schedules/remaining-runs?minimumRuns=1`
**Topics Covered**: `$gt` (greater than operator)

```bash
curl -X GET "http://localhost:3000/api/queries/schedules/remaining-runs?minimumRuns=1" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 2. Get Prescriptions by Date Range
**Endpoint**: `GET /api/queries/prescriptions/by-date?fromDate=2024-01-01&toDate=2024-12-31`
**Topics Covered**: `$gte`, `$lte` (comparison range)

```bash
curl -X GET "http://localhost:3000/api/queries/prescriptions/by-date?fromDate=2024-01-01&toDate=2024-12-31" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 3. Get Prescriptions by Multiple Status
**Endpoint**: `GET /api/queries/prescriptions/by-status-multiple?statuses=Active,Completed`
**Topics Covered**: `$in` (array matching operator)

```bash
curl -X GET "http://localhost:3000/api/queries/prescriptions/by-status-multiple?statuses=Active,Completed" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 4. Get Schedules Excluding Medicines
**Endpoint**: `GET /api/queries/schedules/exclude-medicines?excludeMedicines=Aspirin,Ibuprofen`
**Topics Covered**: `$nin` (not in operator)

```bash
curl -X GET "http://localhost:3000/api/queries/schedules/exclude-medicines?excludeMedicines=Aspirin,Ibuprofen" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### LOGICAL OPERATORS

#### 5. Get Recent Active or Completed Prescriptions
**Endpoint**: `GET /api/queries/prescriptions/recent-active-completed`
**Topics Covered**: `$or`, `$and` (logical operators)

```bash
curl -X GET http://localhost:3000/api/queries/prescriptions/recent-active-completed \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### ELEMENT OPERATORS

#### 6. Get Users Without Avatar
**Endpoint**: `GET /api/queries/users/without-avatar`
**Topics Covered**: `$exists` (element operator)

```bash
curl -X GET http://localhost:3000/api/queries/users/without-avatar \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 7. Validate Prescription Structure
**Endpoint**: `GET /api/queries/prescriptions/validate-structure`
**Topics Covered**: `$type` (type checking operator)

```bash
curl -X GET http://localhost:3000/api/queries/prescriptions/validate-structure \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### ARRAY QUERY OPERATORS

#### 8. Find Prescriptions by Multiple Meds
**Endpoint**: `GET /api/queries/prescriptions/find-by-multiple-meds?medications=Aspirin,Lisinopril`
**Topics Covered**: `$all` (array contains all)

```bash
curl -X GET "http://localhost:3000/api/queries/prescriptions/find-by-multiple-meds?medications=Aspirin,Lisinopril" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 9. Find Medication by Name and Frequency
**Endpoint**: `GET /api/queries/prescriptions/find-by-med-freq?name=Aspirin&frequency=twice daily`
**Topics Covered**: `$elemMatch` (compound array query)

```bash
curl -X GET "http://localhost:3000/api/queries/prescriptions/find-by-med-freq?name=Aspirin&frequency=twice%20daily" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 10. Get Prescriptions by Medication Count
**Endpoint**: `GET /api/queries/prescriptions/by-medication-count?count=3`
**Topics Covered**: `$size` (array size)

```bash
curl -X GET "http://localhost:3000/api/queries/prescriptions/by-medication-count?count=3" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### ARRAY UPDATE OPERATORS

#### 11. Add Medication to Prescription
**Endpoint**: `POST /api/queries/prescriptions/{prescriptionId}/add-medication`
**Topics Covered**: `$push` (append to array)
**Body**:
```json
{
  "medication": {
    "name": "Ibuprofen",
    "dosage": "200mg",
    "frequency": "three times daily",
    "duration": "5 days",
    "instructions": "Take with food"
  }
}
```

```bash
curl -X POST http://localhost:3000/api/queries/prescriptions/123/add-medication \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medication": {
      "name": "Ibuprofen",
      "dosage": "200mg",
      "frequency": "three times daily",
      "duration": "5 days",
      "instructions": "Take with food"
    }
  }'
```

#### 12. Add Multiple Medications
**Endpoint**: `POST /api/queries/prescriptions/{prescriptionId}/add-multiple-medications`
**Topics Covered**: `$push` with `$each` modifier
**Body**: Array of medications

```bash
curl -X POST http://localhost:3000/api/queries/prescriptions/123/add-multiple-medications \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medications": [
      {"name": "Med1", "dosage": "100mg", "frequency": "daily", "duration": "7 days", "instructions": ""},
      {"name": "Med2", "dosage": "200mg", "frequency": "twice daily", "duration": "5 days", "instructions": ""}
    ]
  }'
```

#### 13. Add Allergy (No Duplicates)
**Endpoint**: `POST /api/queries/prescriptions/{prescriptionId}/add-allergy`
**Topics Covered**: `$addToSet` (unique array append)
**Body**: `{ "allergen": "Penicillin" }`

```bash
curl -X POST http://localhost:3000/api/queries/prescriptions/123/add-allergy \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allergen": "Penicillin"}'
```

#### 14. Remove Last Medication
**Endpoint**: `PATCH /api/queries/prescriptions/{prescriptionId}/remove-last-medication`
**Topics Covered**: `$pop` (remove from array end)

```bash
curl -X PATCH http://localhost:3000/api/queries/prescriptions/123/remove-last-medication \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 15. Remove Medication by Name
**Endpoint**: `PATCH /api/queries/prescriptions/remove-by-name`
**Topics Covered**: `$pull` (remove matching elements)
**Body**: `{ "medicationName": "Aspirin" }`

```bash
curl -X PATCH http://localhost:3000/api/queries/prescriptions/remove-by-name \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"medicationName": "Aspirin"}'
```

#### 16. Remove Multiple Medicines
**Endpoint**: `PATCH /api/queries/prescriptions/{prescriptionId}/remove-medicines`
**Topics Covered**: `$pullAll` (remove multiple specific values)
**Body**: `{ "medicineNames": ["Aspirin", "Ibuprofen"] }`

```bash
curl -X PATCH http://localhost:3000/api/queries/prescriptions/123/remove-medicines \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"medicineNames": ["Aspirin", "Ibuprofen"]}'
```

### UPDATE OPERATORS

#### 17. Update User Avatar
**Endpoint**: `PATCH /api/queries/users/avatar`
**Topics Covered**: `$set` (set field value)
**Body**: `{ "avatarUrl": "https://..." }`

```bash
curl -X PATCH http://localhost:3000/api/queries/users/avatar \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"avatarUrl": "https://example.com/avatar.jpg"}'
```

#### 18. Increment Schedule Reminder Count
**Endpoint**: `PATCH /api/queries/schedules/{scheduleId}/increment-reminder`
**Topics Covered**: `$inc` (increment field value)

```bash
curl -X PATCH http://localhost:3000/api/queries/schedules/123/increment-reminder \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 19. Update Prescription If Newer
**Endpoint**: `PATCH /api/queries/prescriptions/{prescriptionId}/update-if-newer`
**Topics Covered**: `$max` (update only if greater)
**Body**: `{ "newDate": "2024-12-31T23:59:59Z" }`

```bash
curl -X PATCH http://localhost:3000/api/queries/prescriptions/123/update-if-newer \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newDate": "2024-12-31T23:59:59Z"}'
```

#### 20. Refresh Prescription Timestamp
**Endpoint**: `PATCH /api/queries/prescriptions/{prescriptionId}/refresh-timestamp`
**Topics Covered**: `$currentDate` (set to current date)

```bash
curl -X PATCH http://localhost:3000/api/queries/prescriptions/123/refresh-timestamp \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### BULK OPERATIONS

#### 21. Bulk Create Prescriptions
**Endpoint**: `POST /api/queries/prescriptions/bulk-create`
**Topics Covered**: Bulk operations, `insertMany()`
**Body**: Array of prescriptions

```bash
curl -X POST http://localhost:3000/api/queries/prescriptions/bulk-create \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prescriptions": [
      {"medications": [{"name": "Med1", "dosage": "100mg"}], "status": "Active"},
      {"medications": [{"name": "Med2", "dosage": "200mg"}], "status": "Active"}
    ]
  }'
```

### NESTED DOCUMENT QUERIES

#### 22. Search Medication by Name
**Endpoint**: `GET /api/queries/medications/search-by-name?medicationName=Aspirin`
**Topics Covered**: Dot notation for nested fields, Regex search

```bash
curl -X GET "http://localhost:3000/api/queries/medications/search-by-name?medicationName=Aspirin" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

#### 23. Find High Dosage Medications
**Endpoint**: `GET /api/queries/medications/high-dosage`
**Topics Covered**: Dot notation, complex regex patterns

```bash
curl -X GET http://localhost:3000/api/queries/medications/high-dosage \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

---

## Testing with Postman

1. Import the collection endpoints above into Postman
2. Create a new environment variable `accessToken` with your JWT token
3. Use `{{accessToken}}` in the Cookie header: `accessToken={{accessToken}}`
4. Test each endpoint to verify functionality

---

## MongoDB Concepts Demonstrated

| Concept | Endpoint | File |
|---------|----------|------|
| Indexing (Single, Compound, Text, Multikey) | All | `backend/src/models/*.js` |
| Aggregation Pipeline | `/api/aggregation/*` | `aggregation.controller.js` |
| $match, $group, $unwind | Aggregation endpoints | aggregation.controller.js |
| $lookup (JOIN) | `/api/aggregation/prescriptions/with-user` | aggregation.controller.js |
| $facet | `/api/aggregation/prescriptions/dashboard` | aggregation.controller.js |
| $bucket | `/api/aggregation/prescriptions/by-medication-bucket` | aggregation.controller.js |
| $out | `/api/aggregation/prescriptions/export-summary` | aggregation.controller.js |
| $text, $search | `/api/aggregation/medications/search` | aggregation.controller.js |
| Comparison Operators | `/api/queries/schedules/*`, `/api/queries/prescriptions/by-*` | advanced-queries.controller.js |
| Logical Operators | `/api/queries/prescriptions/recent-*` | advanced-queries.controller.js |
| Element Operators | `/api/queries/users/without-avatar`, `/api/queries/prescriptions/validate-*` | advanced-queries.controller.js |
| Array Query Operators | `/api/queries/prescriptions/find-*`, `/api/queries/prescriptions/by-medication-count` | advanced-queries.controller.js |
| Array Update Operators | `/api/queries/prescriptions/*/add-*`, `/api/queries/prescriptions/*/remove-*` | advanced-queries.controller.js |
| Update Operators | `/api/queries/users/avatar`, `/api/queries/schedules/*/increment-*` | advanced-queries.controller.js |
| Nested Documents | `/api/queries/medications/search-*`, `MedicationSchema in Prescription` | prescription.model.js, advanced-queries.controller.js |
| Embedded Documents | Prescription with medications array | prescription.model.js |

---

## Verification Steps for Evaluation

1. **Verify Indexes Created**:
   - Check MongoDB Compass for indexes on each collection
   - Use `db.collection.getIndexes()` in MongoDB shell

2. **Test Aggregation Framework**:
   - Run at least 3 aggregation endpoints
   - Verify they return correct aggregated data

3. **Test Query Operators**:
   - Test comparison operators ($gt, $lt, $in, $nin)
   - Test logical operators ($and, $or)
   - Test element operators ($exists, $type)
   - Test array operations ($push, $pull, $addToSet, etc.)

4. **Verify CRUD Coverage**:
   - All CRUD operations already exist in prescription.controller.js
   - Enhanced with array and nested document operations

5. **Document All Topics**:
   - See `MONGODB_EVALUATION_ANALYSIS.md` for comprehensive documentation
   - Each endpoint demonstrates specific MongoDB concepts

---

## Next Steps

1. Run `npm install` in backend folder if needed
2. Start the server: `npm run dev`
3. Login to get authentication token
4. Test each endpoint using curl or Postman
5. Monitor MongoDB logs to see index usage
6. Show your professor the code structure and endpoints

Good luck with your evaluation! 🎯
