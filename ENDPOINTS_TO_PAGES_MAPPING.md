# Frontend Pages to Backend Endpoints Mapping

## Overview
This document maps all newly created MongoDB feature pages to their corresponding backend endpoints, MongoDB topics covered, and how to access them.

---

## 🏠 **Home Page** (`/`)
**Purpose:** Landing page for authenticated users showcasing all MongoDB features

### Access Points:
- Main navigation bar (after login)
- Direct URL: `http://localhost:5173/`

### Features Displayed:
- 6 feature cards with descriptions
- Each card is clickable and links to corresponding feature page
- MongoDB topics highlighted for each feature

---

## 📊 **Analytics Dashboard** (`/analytics`)
**Frontend Page:** `src/pages/Analytics.jsx`

### MongoDB Topics:
- **Aggregation Pipelines** ($group, $sum, $unwind, $sort)
- **Data Transformation** with $project
- **Data Grouping** with $group
- **Array Operations** with $unwind

### Backend Endpoints Used:

#### 1. **Medication Statistics**
```
GET /api/analytics/medication-statistics
```
- **Purpose:** Get medication usage statistics across all users
- **Response:** Array of medications with count, total usages
- **MongoDB Pipeline:** 
  - Groups medications by name
  - Calculates count and sum of dosages
  - Sorts by count (descending)

#### 2. **Prescription Dashboard**
```
GET /api/analytics/prescription-dashboard
```
- **Purpose:** Overview of all prescriptions with status breakdown
- **Response:** Object with total count, active count, completed count, expired count
- **MongoDB Pipeline:**
  - Groups by status
  - Counts prescriptions per status
  - Returns aggregated statistics

#### 3. **Prescriptions with User Data**
```
GET /api/analytics/prescriptions-with-users
```
- **Purpose:** Get prescriptions joined with user information
- **Response:** Array of prescriptions with embedded user details
- **MongoDB Pipeline:**
  - Uses $lookup to JOIN prescriptions with users collection
  - Enriches prescription data with user info
  - Projects specific fields

#### 4. **Medications Bucket Analysis**
```
GET /api/analytics/medications-bucket
```
- **Purpose:** Categorize medications by dosage buckets
- **Response:** Array of dosage buckets with medication counts
- **MongoDB Pipeline:**
  - Uses $bucket to categorize by dosage ranges
  - Counts medications in each bucket
  - Useful for inventory and distribution analysis

### Frontend Components:
- `PrescriptionStats.jsx` - Displays stat cards with icons and values
- Uses React hooks (useState, useEffect) for data fetching
- Implements loading states and error handling
- Dark theme with blue accents

### Design Integration:
- Stat cards in grid layout
- Color-coded badges (green/red/amber)
- Smooth fade-in animation via PageWrapper
- Responsive design (1-3 columns based on screen size)

---

## 🔍 **Advanced Search** (`/advanced-search`)
**Frontend Page:** `src/pages/AdvancedSearch.jsx`

### MongoDB Topics:
- **Query Operators** ($in, $nin, $regex, $gte, $lte)
- **Text Search** patterns
- **Nested Document Queries** with dot notation
- **Date Range Filtering**

### Backend Endpoints Used:

#### 1. **Prescriptions by Date Range**
```
POST /api/search/prescriptions-date-range
```
- **Body:** 
  ```json
  {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }
  ```
- **Purpose:** Find prescriptions issued between two dates
- **MongoDB Query:** `{ dateIssued: { $gte: startDate, $lte: endDate } }`
- **Response:** Array of prescriptions

#### 2. **Prescriptions by Status**
```
GET /api/search/prescriptions-status?status=Active
```
- **Purpose:** Filter prescriptions by status (Active/Completed/Expired)
- **Query Parameters:** status
- **MongoDB Query:** `{ status: "Active" }`
- **Response:** Array of prescriptions with given status

#### 3. **Medications by Name (Regex Search)**
```
GET /api/search/medications-by-name?name=aspirin
```
- **Purpose:** Search medications by name (partial/fuzzy match)
- **Query Parameters:** name
- **MongoDB Query:** `{ "medications.name": { $regex: "aspirin", $options: "i" } }`
- **Response:** Array of prescriptions containing matching medications

#### 4. **Active Schedules**
```
GET /api/search/active-schedules
```
- **Purpose:** Get all active medication schedules
- **MongoDB Query:** `{ status: "active" }` on schedules collection
- **Response:** Array of active schedules with medication details

#### 5. **Schedules with Remaining Runs**
```
GET /api/search/schedules-remaining-runs?remainingDays=7
```
- **Purpose:** Get schedules expiring within specified days
- **Query Parameters:** remainingDays (default: 7)
- **MongoDB Query:** Uses date arithmetic to find near-expiry schedules
- **Response:** Array of schedules with calculated remaining runs

#### 6. **User Medication History**
```
GET /api/search/user-medication-history?userId=<userId>
```
- **Purpose:** Get all medications taken by a specific user with history
- **Query Parameters:** userId
- **MongoDB Query:** $lookup to join with user and prescription data
- **Response:** Detailed medication history with dates and dosages

### Frontend Components:
- `AdvancedSearch.jsx` (Component) - Search filters and controls
- Multiple filter types:
  - Date range picker
  - Status dropdown
  - Medication name search box
  - Schedule filters
- Real-time filter application

### Design Integration:
- Filter section at top with labeled inputs
- Results displayed in card grid below
- Color-coded status indicators
- Subtle borders and spacing matching Home design

---

## 📈 **Data Insights** (`/data-insights`)
**Frontend Page:** `src/pages/DataInsights.jsx`

### MongoDB Topics:
- **$lookup Operator** (JOIN operations)
- **$facet Operator** (Multiple parallel pipelines)
- **Pagination** with $skip and $limit
- **Sorting & Filtering** in complex queries
- **Array Aggregation** operations

### Backend Endpoints Used:

#### 1. **Prescriptions with Pagination**
```
GET /api/search/schedules-with-pagination?page=1&limit=10
```
- **Purpose:** Get paginated schedule data for performance
- **Query Parameters:** 
  - `page`: Page number (1-indexed)
  - `limit`: Items per page (default: 10)
- **MongoDB Pipeline:**
  - Skip: `(page - 1) * limit`
  - Limit: `limit`
  - Provides offset-based pagination
- **Response:** 
  ```json
  {
    "data": [...],
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
  ```

#### 2. **User Medication History with Details**
```
GET /api/search/user-medication-history
```
- **Purpose:** Complex join showing user → prescriptions → medications
- **MongoDB Pipeline:**
  - $match: Filter by user
  - $lookup: Join with prescriptions
  - $unwind: Expand medication arrays
  - $sort: Most recent first
  - $limit: Top results
- **Response:** Enriched medication history

#### 3. **Prescription Statistics (Multi-facet)**
```
POST /api/analytics/prescriptions-grouped
```
- **Body:**
  ```json
  {
    "facets": ["status", "doctorName"]
  }
  ```
- **Purpose:** Get parallel aggregations across multiple fields
- **MongoDB Pipeline:**
  - $facet to run multiple pipelines simultaneously
  - Groups by status AND doctor name in parallel
  - More efficient than separate queries
- **Response:** Object with results for each facet

### Frontend Components:
- Data table with pagination controls
- Multiple views for different insights
- Sorting capabilities
- Expandable rows for detail view

### Design Integration:
- Table-based layout with card details on row expand
- Previous/Next pagination buttons
- Page number indicator
- Smooth transitions between pages

---

## 💊 **Upload Prescriptions** (`/upload`)
**Frontend Component:** `src/components/upload.jsx`

### Purpose:
- Upload and extract prescription images using ML model
- Validates and stores to database

### Related MongoDB Features:
- **Indexes** on frequently queried fields
- **Validation** rules for prescription data
- **CRUD Operations** (Create prescriptions)

### Database Operations:
- After extraction, creates new prescription document
- Validates medication fields
- Indexes on: patientName, status, dateIssued, userId

### Design Integration:
- Drag-and-drop area for image upload
- Progress indicator during ML processing
- Results display with parsed medication data
- Link to Advanced Search to find similar prescriptions
- Link to Analytics to see statistics after upload

---

## 📋 **Prescriptions Management** (`/prescriptions`)
**Frontend Component:** `src/components/prescriptions.jsx`

### Purpose:
- View, edit, and delete all prescriptions
- CRUD operations on prescription data

### Related MongoDB Features:
- **CRUD Operations** - Create, Read, Update, Delete
- **Array Operations** - Managing medications array
- **Data Validation** - Ensuring data integrity

### API Endpoints:
- `GET /api/prescriptions` - List all prescriptions
- `PUT /api/prescriptions/:id` - Update prescription medications
- `DELETE /api/prescriptions/:id` - Delete prescription

### Accessible from:
- Main navigation (authenticated users)
- Feature card on Home page
- Contextual link from Upload page

### Design Integration:
- Links to:
  - Advanced Search (filter prescriptions)
  - Analytics (view prescription statistics)
  - Data Insights (see detailed medication history)
- Subtle "Explore Related" section in prescription detail view

---

## 📅 **Schedule Management** (`/schedule`)
**Frontend Component:** `src/components/ScheduleSetup.jsx`

### Purpose:
- Create and manage medication schedules
- Set up reminders and notifications

### Related MongoDB Features:
- **Embedded Documents** - Storing medication items
- **Indexes** - For quick schedule lookups
- **Date Operations** - Calculating next dose times

### Database Operations:
- Creates schedule documents with embedded medications
- Indexes on: chatId, userId, status, createdAt

### Accessible from:
- Main navigation (authenticated users)
- Feature card on Home page

### Design Integration:
- Links to:
  - Advanced Search (find active schedules)
  - Data Insights (view medication history and reminders)

---

## 🔗 **Navigation Links Summary**

### From Home Page (`/`)
- ✅ Analytics Dashboard → `/analytics`
- ✅ Advanced Search → `/advanced-search`
- ✅ Data Insights → `/data-insights`
- ✅ Manage Prescriptions → `/prescriptions`
- ✅ Schedule Medication → `/schedule`
- ✅ Upload Prescriptions → `/upload`

### From Upload Page (`/upload`)
- ✨ NEW: View similar prescriptions → `/advanced-search`
- ✨ NEW: See prescription statistics → `/analytics`
- ✨ NEW: View medication history → `/data-insights`

### From Prescriptions Page (`/prescriptions`)
- ✨ NEW: Find similar medications → `/advanced-search`
- ✨ NEW: View prescription stats → `/analytics`
- ✨ NEW: See detailed history → `/data-insights`

### From Schedule Page (`/schedule`)
- ✨ NEW: Check active schedules → `/advanced-search`
- ✨ NEW: View schedule analytics → `/analytics`

### From Analytics Page (`/analytics`)
- ✨ NEW: Back to Advanced Search → `/advanced-search`
- ✨ NEW: View detailed insights → `/data-insights`

### From Advanced Search Page (`/advanced-search`)
- ✨ NEW: View search results in insights → `/data-insights`
- ✨ NEW: Back to Analytics → `/analytics`

### From Data Insights Page (`/data-insights`)
- ✨ NEW: Refine search → `/advanced-search`
- ✨ NEW: View summary stats → `/analytics`

---

## 🧪 **Testing Guide**

### Quick Test Flow:
1. **Login** → Navigate to Home
2. **Upload** → Go to `/upload` and upload a prescription image
3. **View Analytics** → Click "Analytics Dashboard" card
   - Should see medication statistics
4. **Advanced Search** → Click "Advanced Search" card
   - Filter by status, date range, or medication name
5. **Data Insights** → Click "Data Insights" card
   - See detailed medication history with pagination
6. **Manage Schedules** → Go to `/schedule`
   - Create a schedule using extracted data
7. **View Prescriptions** → Go to `/prescriptions`
   - See all stored prescriptions with edit/delete options

### Endpoints to Test Independently:
```bash
# Analytics Endpoints
curl http://localhost:3000/api/analytics/medication-statistics
curl http://localhost:3000/api/analytics/prescription-dashboard
curl http://localhost:3000/api/analytics/prescriptions-with-users
curl http://localhost:3000/api/analytics/medications-bucket

# Advanced Search Endpoints
curl http://localhost:3000/api/search/prescriptions-status?status=Active
curl http://localhost:3000/api/search/medications-by-name?name=aspirin
curl http://localhost:3000/api/search/active-schedules
curl http://localhost:3000/api/search/schedules-remaining-runs
curl http://localhost:3000/api/search/user-medication-history

# Data Insights Endpoints
curl http://localhost:3000/api/search/schedules-with-pagination?page=1&limit=10
curl -X POST http://localhost:3000/api/analytics/prescriptions-grouped \
  -H "Content-Type: application/json" \
  -d '{"facets":["status"]}'
```

---

## 📱 **MongoDB Topics Covered by Feature**

| MongoDB Topic | Feature Page | Endpoint | Example |
|---|---|---|---|
| **$group** | Analytics | `/api/analytics/medication-statistics` | Count medications by name |
| **$sum** | Analytics | `/api/analytics/medication-statistics` | Sum total dosages |
| **$unwind** | Analytics | `/api/analytics/medication-statistics` | Expand medication arrays |
| **$sort** | Analytics | `/api/analytics/medication-statistics` | Sort by count desc |
| **$lookup** | Data Insights | `/api/search/user-medication-history` | JOIN prescriptions with users |
| **$facet** | Data Insights | `/api/analytics/prescriptions-grouped` | Parallel aggregations |
| **$skip/$limit** | Data Insights | `/api/search/schedules-with-pagination` | Pagination logic |
| **$regex** | Advanced Search | `/api/search/medications-by-name` | Fuzzy medication search |
| **$in, $gte, $lte** | Advanced Search | `/api/search/prescriptions-date-range` | Range queries |
| **$match** | All aggregations | Various | Filter documents |
| **$project** | All aggregations | Various | Select specific fields |
| **Indexes** | Upload | `/api/prescriptions` | Fast queries on frequently searched fields |
| **CRUD** | Prescriptions | `/api/prescriptions` | Create, Read, Update, Delete |
| **Array Operations** | Prescriptions | `/api/prescriptions` | Manage medications array |
| **Embedded Documents** | Schedule | `/api/schedules` | Store medications within schedule |
| **Validation** | Upload | `/api/prescriptions` | Schema validation on create |

---

## 🎨 **Design Integration Notes**

All new hyperlinks are integrated subtly into the existing design:

### Subtle Integration Techniques:
1. **Feature Cards** - Clickable cards on Home page (primary CTA)
2. **Action Links** - Small text links at bottom of each page section
3. **Related Content** - "Explore Related" sections with icon + link
4. **Contextual Buttons** - Links appear where naturally relevant
5. **Hover Effects** - Blue accent color on hover (matches theme)
6. **Icon Usage** - Lucide React icons for visual cues
7. **Color Coding** - Status badges (green/red/amber) consistent

### Theme Consistency:
- Background: `bg-gray-900` (dark)
- Text: `text-gray-100` (light)
- Primary Accent: `text-blue-400` / `hover:text-blue-300`
- Secondary Accents: `bg-purple-600`, `bg-green-600`, etc.
- Borders: `border-gray-700` (subtle)
- Shadows: `shadow-sm` (minimal)

---

## ✅ **Verification Checklist**

- [ ] All feature pages load without errors
- [ ] Navigation links work correctly
- [ ] Backend endpoints return data
- [ ] Frontend displays aggregation results
- [ ] Filters and search work as expected
- [ ] Pagination works (if applicable)
- [ ] Date pickers work correctly
- [ ] Status badges display correctly
- [ ] Links fit naturally in design
- [ ] Responsive on mobile (tested at 320px, 768px, 1024px)
- [ ] No console errors when clicking links
- [ ] Auth protection works (can't access without login)

---

**Last Updated:** April 30, 2026  
**Version:** 2.0 - Complete Frontend-Backend Mapping
