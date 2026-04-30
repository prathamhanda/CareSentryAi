# Quick Testing Guide: Frontend Pages & Endpoints

## 📋 Quick Reference: All Frontend Pages & Their Endpoints

### Page: Home (`/`)
**URL:** http://localhost:5173/

**Purpose:** Dashboard with MongoDB feature cards

**No API calls** - Static UI with navigation buttons

**Features:**
- 6 clickable feature cards
- Each card links to a MongoDB feature page
- MongoDB topics listed
- Authentication required

---

### Page: Upload Prescriptions (`/upload`)
**URL:** http://localhost:5173/upload

**Component:** `src/components/upload.jsx`

**Purpose:** Upload prescription images and extract medication data

**API Endpoints:**
1. **ML OCR Server** (External)
   ```
   POST http://localhost:5000/extract
   Body: FormData with image file
   Response: Extracted prescription data
   ```

2. **Save Prescription to MongoDB**
   ```
   POST /api/prescriptions
   Body: {
     patientName: string,
     doctorName: string,
     diagnosis: string,
     medications: [{name, dosage, frequency, duration}]
   }
   Response: Saved prescription document
   ```

**MongoDB Topics Demonstrated:**
- Indexes (on patientName, status, dateIssued)
- Validation (prescription schema validation)
- CRUD: Create operation

**How to Test:**
1. Go to `/upload`
2. Select or drag a prescription image
3. Click "Scan Prescription"
4. Wait for extraction
5. Click "Save Prescription"
6. Should redirect to `/prescriptions` and display saved data

---

### Page: Manage Prescriptions (`/prescriptions`)
**URL:** http://localhost:5173/prescriptions

**Component:** `src/components/prescriptions.jsx`

**Purpose:** View, edit, and delete prescriptions

**API Endpoints:**

1. **Get All Prescriptions**
   ```
   GET /api/prescriptions
   Response: {
     status: string,
     message: string,
     data: [prescriptionObjects]
   }
   ```

2. **Update Prescription**
   ```
   PUT /api/prescriptions/:id
   Body: { medications: [...] }
   Response: Updated prescription object
   ```

3. **Delete Prescription**
   ```
   DELETE /api/prescriptions/:id
   Response: { success: true }
   ```

**MongoDB Topics Demonstrated:**
- CRUD Operations (Read, Update, Delete)
- Array Operations (medications array manipulation)
- Data Validation

**How to Test:**
1. Go to `/prescriptions`
2. View list of all prescriptions (should fetch with GET)
3. Click "Edit" on any prescription
4. Modify medications
5. Click "Save" (PUT request)
6. Click "Delete" to remove (DELETE request)
7. Click related feature buttons at bottom to navigate

---

### Page: Schedule Medication (`/schedule`)
**URL:** http://localhost:5173/schedule

**Component:** `src/components/ScheduleSetup.jsx`

**Purpose:** Create medication schedules with Telegram reminders

**API Endpoints:**

1. **Create Schedule**
   ```
   POST /api/schedules
   Body: {
     chatId: string (Telegram chat ID),
     schedules: [{
       medicine: string,
       time: string (HH:MM format),
       duration: number
     }]
   }
   Response: { success: true, message: string }
   ```

**MongoDB Topics Demonstrated:**
- Embedded Documents (schedules with medications)
- Indexes (on chatId, userId, status)
- Date Operations

**How to Test:**
1. Go to `/schedule`
2. Get Telegram Chat ID from @userinfobot
3. Enter Chat ID
4. Add medicines with time and duration
5. Click "Create Schedule"
6. Should receive Telegram notifications

---

### Page: Analytics Dashboard (`/analytics`)
**URL:** http://localhost:5173/analytics

**Component:** `src/components/PrescriptionStats.jsx`

**Purpose:** View prescription statistics using aggregation pipelines

**API Endpoints:**

1. **Medication Statistics** (Aggregation)
   ```
   GET /api/aggregation/medications/stats
   Response: [{
     _id: medication_name,
     totalCount: number,
     frequencies: [array of frequencies],
     maxDosage: string
   }]
   
   MongoDB Pipeline: $match → $unwind → $group → $sort
   ```

2. **Prescription Dashboard** (Aggregation)
   ```
   GET /api/aggregation/prescriptions/dashboard
   Response: {
     totalPrescriptions: number,
     activePrescriptions: number,
     completedPrescriptions: number,
     expiredPrescriptions: number
   }
   
   MongoDB Pipeline: $match → $group → count operations
   ```

**MongoDB Topics Demonstrated:**
- Aggregation Framework
- $group operator (with counters)
- $sum operator (totals)
- $unwind operator (array expansion)
- $sort operator (ordering)

**How to Test:**
1. Go to `/analytics`
2. Should show:
   - Total prescriptions stat card
   - Active prescriptions stat card
   - Completed prescriptions stat card
   - Unique medications count
   - Top 5 prescribed medications with progress bars
3. Click "Refresh Analytics" to reload data
4. Click related feature buttons at bottom

---

### Page: Advanced Search (`/advanced-search`)
**URL:** http://localhost:5173/advanced-search

**Component:** `src/components/AdvancedSearch.jsx`

**Purpose:** Execute complex queries with various operators

**API Endpoints:**

1. **Prescriptions by Status** (Query with $in)
   ```
   GET /api/queries/prescriptions/by-status-multiple?statuses=Active
   Response: [prescriptionObjects]
   
   MongoDB Query: { status: { $in: [statuses] } }
   ```

2. **Medications by Name** (Query with $regex)
   ```
   GET /api/queries/prescriptions/find-medication-by-name?medName=aspirin
   Response: [prescriptionObjects]
   
   MongoDB Query: { "medications.name": { $regex: medName, $options: "i" } }
   ```

3. **Prescriptions by Date Range** (Query with $gte, $lte)
   ```
   GET /api/queries/prescriptions/by-date?fromDate=2025-01-01&toDate=2025-12-31
   Response: [prescriptionObjects]
   
   MongoDB Query: { dateIssued: { $gte: fromDate, $lte: toDate } }
   ```

**MongoDB Topics Demonstrated:**
- Query Operators: $in, $regex, $gte, $lte
- Dot Notation (nested field queries)
- Text Search patterns

**How to Test:**
1. Go to `/advanced-search`
2. **Test Status Filter:**
   - Select status "Active", click "Execute Search"
   - Should show all active prescriptions
3. **Test Medication Search:**
   - Change search type to "Medications"
   - Type a medication name (e.g., "aspirin")
   - Should show prescriptions containing that medication
4. **Test Date Range:**
   - Change to date range
   - Select "Last 7 Days" or "Last 30 Days"
   - Should filter by date
5. View statistics cards above results
6. Click related feature buttons at bottom

---

### Page: Data Insights (`/data-insights`)
**URL:** http://localhost:5173/data-insights

**Component:** `src/pages/DataInsights.jsx`

**Purpose:** View complex data with JOINs and pagination

**API Endpoints:**

1. **Prescriptions with User Data** ($lookup JOIN)
   ```
   GET /api/aggregation/prescriptions/with-user
   Response: [{
     prescriptionNumber: string,
     patientName: string,
     medications: [...],
     user: [{
       username: string,
       email: string
     }]
   }]
   
   MongoDB Pipeline: $lookup (users collection)
   ```

2. **Paginated Prescriptions** ($facet parallel pipelines)
   ```
   GET /api/aggregation/prescriptions/paginated?page=1&limit=5
   Response: {
     data: [prescriptionObjects],
     total: number,
     pages: number
   }
   
   MongoDB Pipeline: $facet with $skip + $limit
   ```

**MongoDB Topics Demonstrated:**
- $lookup Operator (JOIN operations)
- $facet Operator (parallel pipelines)
- $skip and $limit (pagination)
- Metadata calculation (total count, pages)

**How to Test:**
1. Go to `/data-insights`
2. Should display:
   - 3 stat cards (records count, total prescriptions, pages)
   - "Prescriptions with User Information" section showing JOINed data
   - "Paginated Results (Page 1)" showing first 5 prescriptions
3. Review the explanations for $lookup and $facet
4. Click "Refresh Insights" to reload
5. Click related feature buttons at bottom

---

## 🧪 Complete Testing Workflow

### Workflow 1: Full Data Entry & Analysis
1. **Start:** Go to Home (`/`)
2. **Upload:** Click "Upload Prescriptions" card → Upload an image
3. **View:** Click "Save Prescription"
4. **Manage:** Go to Prescriptions (`/prescriptions`)
5. **Search:** Click "Advanced Search" link → Try different filters
6. **Analyze:** Click "Analytics" link → View statistics
7. **Insights:** Click "Data Insights" link → See JOINed data

### Workflow 2: Quick Analytics Check
1. **Analytics:** `/analytics` → View medication statistics
2. **Search:** Click "Advanced Search" link
3. **Insights:** Click "Data Insights" link

### Workflow 3: Medication Management
1. **Schedule:** `/schedule` → Create medication schedule
2. **View:** `/prescriptions` → See all medications
3. **Analytics:** `/analytics` → Check statistics

---

## 📡 Backend Server Requirements

Before testing, ensure:

```bash
# Terminal 1: Backend Server
cd backend
npm install  # If needed
npm run dev
# Should start on http://localhost:3000

# Terminal 2: ML OCR Server
cd disease_model
python app.py
# Should start on http://localhost:5000

# Terminal 3: Frontend Dev Server
cd frontend
npm install  # If needed
npm run dev
# Should start on http://localhost:5173
```

---

## ✅ Quick Endpoint Testing with curl

```bash
# Test Analytics Endpoint
curl http://localhost:3000/api/aggregation/medications/stats

# Test Prescriptions Endpoint
curl http://localhost:3000/api/prescriptions

# Test Advanced Search
curl "http://localhost:3000/api/queries/prescriptions/by-status-multiple?statuses=Active"

# Test Data Insights with JOIN
curl http://localhost:3000/api/aggregation/prescriptions/with-user

# Test Pagination
curl "http://localhost:3000/api/aggregation/prescriptions/paginated?page=1&limit=5"
```

---

## 🎯 Hyperlinks on Each Page

### Home (`/`)
- ✅ 6 feature cards (clickable)

### Upload (`/upload`)
- ✅ View Analytics (after scan)
- ✅ Search Similar (after scan)
- ✅ View Insights (after scan)

### Prescriptions (`/prescriptions`)
- ✅ Advanced Search
- ✅ Analytics
- ✅ Data Insights

### Schedule (`/schedule`)
- ✅ Check Active Schedules (Advanced Search)
- ✅ View Schedule Analytics

### Analytics (`/analytics`)
- ✅ Advanced Search
- ✅ Data Insights

### Advanced Search (`/advanced-search`)
- ✅ Analytics Dashboard
- ✅ Data Insights

### Data Insights (`/data-insights`)
- ✅ Analytics Dashboard
- ✅ Advanced Search

---

## 📊 MongoDB Topics Coverage Map

| Page | Topics | Endpoints |
|------|--------|-----------|
| Upload | Indexes, Validation, CRUD | POST /api/prescriptions |
| Prescriptions | CRUD, Array Ops | GET/PUT/DELETE /api/prescriptions |
| Schedule | Embedded Docs, Indexes | POST /api/schedules |
| Analytics | Aggregation, $group, $sum | GET /api/aggregation/* |
| Advanced Search | Query Ops, $regex, $in | GET /api/queries/* |
| Data Insights | $lookup, $facet, Pagination | GET /api/aggregation/* |

---

## 🎓 For Professor Evaluation

**Show:**
1. Upload a prescription → Shows file extraction
2. View Prescriptions → Shows all stored data (CRUD read)
3. Edit a prescription → Shows CRUD update
4. Go to Analytics → Shows aggregation pipelines in action
5. Go to Advanced Search → Shows query operators
6. Go to Data Insights → Shows JOINs and pagination
7. Click hyperlinks between pages → Shows integrated navigation

**Key Points to Mention:**
- 6+ MongoDB topics implemented
- Subtly integrated hyperlinks for discoverability
- Dark theme with consistent design
- Real backend MongoDB integration
- Protected routes (authentication required)
- Multiple aggregation pipelines
- Complex query operators
- Data JOINs with $lookup
- Pagination with $facet

---

**Created:** April 30, 2026  
**Status:** Ready for testing and evaluation
