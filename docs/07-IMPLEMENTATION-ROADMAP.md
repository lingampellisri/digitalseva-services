# Implementation Roadmap — Step-by-Step Build Guide

> Ordered task list with file-level instructions for building the complete system.

---

## Phase 1: Backend Foundation (Day 1-2)

### 1.1 Update Operator Model
**File**: `backend/models/Operator.js`

- [ ] Add `password` field (String, required)
- [ ] Add `role` field (String, default: 'operator', immutable)
- [ ] Add `totalAssigned` field (Number, default: 0)
- [ ] Add `totalCompleted` field (Number, default: 0)
- [ ] Add `lastAssignedAt` field (Date, default: null)
- [ ] Make `phone` field unique
- [ ] Add bcrypt pre-save hook for password hashing
- [ ] Add `matchPassword()` method

### 1.2 Update Admin Model
**File**: `backend/models/Admin.js`

- [ ] Add `role` field (String, default: 'admin', immutable)

### 1.3 Create CustomerRequest Model
**File**: `backend/models/CustomerRequest.js` (NEW)

- [ ] Define schema with all fields from database design doc
- [ ] Add indexes for performance
- [ ] Add status enum validation
- [ ] Add priority enum validation

### 1.4 Create AssignmentCounter Model
**File**: `backend/models/AssignmentCounter.js` (NEW)

- [ ] Simple schema: `lastAssignedIndex`, `totalRequests`

### 1.5 Enhance Auth Middleware
**File**: `backend/middleware/auth.js`

- [ ] Update `protect` to decode role from JWT
- [ ] Attach `{ id, role, operatorId }` to `req.user`
- [ ] Create `authorize(...roles)` middleware
- [ ] Export both `protect` and `authorize`

### 1.6 Update Auth Routes
**File**: `backend/routes/auth.js`

- [ ] Update admin login to include `role: 'admin'` in JWT & response
- [ ] Add `POST /api/auth/operator/login` route
  - Authenticate with phone + password
  - Check `isActive` status
  - Return JWT with `role: 'operator'`

### 1.7 Create Customer Request Routes
**File**: `backend/routes/customerRequests.js` (NEW)

- [ ] `POST /` — Public: Submit application request
  - Validate fields
  - Fetch post details
  - Run round-robin assignment
  - Create request
  - Update operator stats
- [ ] `GET /` — Admin: List all requests with filters
- [ ] `GET /mine` — Operator: List assigned requests
- [ ] `GET /stats` — Admin/Operator: Dashboard statistics
- [ ] `GET /:id` — Admin/Operator: Single request detail
- [ ] `PUT /:id` — Admin/Operator: Update status, notes, message
- [ ] `PUT /:id/reassign` — Admin: Reassign to different operator

### 1.8 Update Post Routes
**File**: `backend/routes/posts.js`

- [ ] Add `authorize('admin')` to POST, PUT, DELETE routes

### 1.9 Update Operator Routes
**File**: `backend/routes/operator.js`

- [ ] Add `authorize('admin')` to protected routes
- [ ] Exclude `password` from public GET responses
- [ ] Add `PATCH /:id/reset-password` route (admin only)
- [ ] Handle password hashing on operator create/update

### 1.10 Register New Routes
**File**: `backend/server.js`

- [ ] Import and mount customer request routes
- [ ] `app.use('/api/customer-requests', customerRequestRoutes);`

---

## Phase 2: Frontend Auth Enhancement (Day 2-3)

### 2.1 Enhanced AuthContext
**File**: `frontend/src/context/AuthContext.jsx`

- [ ] Decode JWT payload on login to extract role
- [ ] Store user object: `{ id, role, name, operatorId }`
- [ ] Add `isAdmin` and `isOperator` computed properties
- [ ] Persist user data in localStorage
- [ ] Hydrate on mount

### 2.2 Create AdminRoute Guard
**File**: `frontend/src/components/AdminRoute.jsx` (NEW)

- [ ] Check `user.role === 'admin'`
- [ ] Redirect to `/admin/login` if unauthorized

### 2.3 Create OperatorRoute Guard
**File**: `frontend/src/components/OperatorRoute.jsx` (NEW)

- [ ] Check `user.role === 'operator'`
- [ ] Redirect to `/operator/login` if unauthorized

### 2.4 Update App.jsx Routing
**File**: `frontend/src/App.jsx`

- [ ] Import new route guards
- [ ] Add `/operator/login` route
- [ ] Add `/operator` protected route
- [ ] Update `/admin` to use `AdminRoute`

---

## Phase 3: Customer Application Form (Day 3-4)

### 3.1 Create CustomerApplicationForm
**File**: `frontend/src/components/CustomerApplicationForm.jsx` (NEW)

- [ ] Form fields: name, age, phone, email, message
- [ ] Auto-populate postId and serviceName
- [ ] Client-side validation (phone format, required fields)
- [ ] Submit via `POST /api/customer-requests`
- [ ] Show success/error states
- [ ] Privacy/security disclaimer text
- [ ] Prevent double submission

### 3.2 Integrate into PostDetailPage
**File**: `frontend/src/pages/PostDetailPage.jsx`

- [ ] Import CustomerApplicationForm
- [ ] Add form below or beside OperatorCard
- [ ] Only show when post is active (not expired)
- [ ] Pass postId, serviceName, serviceCategory as props

### 3.3 Add Translations
**File**: `frontend/src/locales/en/translation.json`

- [ ] Add `applicationForm.*` translations
  - title, name, age, phone, email, message, submit, success, etc.

---

## Phase 4: Operator Portal (Day 4-6)

### 4.1 Create OperatorLogin Page
**File**: `frontend/src/pages/OperatorLogin.jsx` (NEW)

- [ ] Phone + password login form
- [ ] Similar design to AdminLogin
- [ ] Call `POST /api/auth/operator/login`
- [ ] Redirect to `/operator` on success

### 4.2 Create OperatorDashboard Page
**File**: `frontend/src/pages/OperatorDashboard.jsx` (NEW)

- [ ] Sidebar navigation: Dashboard, My Queue, Profile
- [ ] Top bar with operator name + logout
- [ ] Stats cards: Total, Active, Completed, Today
- [ ] Fetch stats from `GET /api/customer-requests/stats`
- [ ] Recent requests preview

### 4.3 Create RequestCard Component
**File**: `frontend/src/components/RequestCard.jsx` (NEW)

- [ ] Display customer info (name, phone, email)
- [ ] Show service name and category
- [ ] Status badge with color coding
- [ ] Expandable detail section
- [ ] Status dropdown to update
- [ ] Internal notes textarea
- [ ] Customer message textarea
- [ ] WhatsApp and Call action buttons
- [ ] Save changes button

### 4.4 Create RequestQueue View
**File**: Inline in OperatorDashboard or separate component

- [ ] List all assigned requests
- [ ] Filter by status dropdown
- [ ] Search by customer name/phone
- [ ] Sort by date (newest first)
- [ ] Pagination or infinite scroll
- [ ] Empty state when no requests

---

## Phase 5: Admin Request Management (Day 6-7)

### 5.1 Create CustomerRequestsAdmin View
**File**: `frontend/src/pages/CustomerRequestsAdmin.jsx` (NEW)

- [ ] Table/card view of all customer requests
- [ ] Filters: status, operator, category, date range
- [ ] Search: customer name, phone, service name
- [ ] Reassign button per request
- [ ] View full status history
- [ ] Operator stats summary

### 5.2 Integrate into AdminDashboard
**File**: `frontend/src/pages/AdminDashboard.jsx`

- [ ] Add CUSTOMER_REQUESTS to VIEWS enum
- [ ] Add sidebar nav item
- [ ] Render CustomerRequestsAdmin in content area
- [ ] Update dashboard stats to include request counts

### 5.3 Update ManageOperator
**File**: `frontend/src/pages/ManageOperator.jsx`

- [ ] Add password field to operator create form
- [ ] Add "Reset Password" button for existing operators
- [ ] Show operator stats (assigned/completed counts)
- [ ] Don't display password in edit form

---

## Phase 6: Polish & Security (Day 7-8)

### 6.1 Input Validation
- [ ] Server-side: Express validator or manual checks
- [ ] Client-side: HTML5 validation + custom regex
- [ ] Phone: 10 digits, starts with 6-9
- [ ] Email: Valid format (optional field)
- [ ] Name: Min 2 chars, max 100
- [ ] Message: Max 1000 chars

### 6.2 Error Handling
- [ ] Global error boundary in React
- [ ] Toast notifications for success/error
- [ ] Consistent error response format from API
- [ ] Network error handling (offline state)

### 6.3 Responsive Testing
- [ ] Test all new pages on mobile (375px, 414px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1280px+)
- [ ] Test operator dashboard sidebar collapse

### 6.4 Translations
- [ ] Add all new strings to English translation file
- [ ] Add Telugu translations for new strings
- [ ] Test language switching on new pages

---

## Phase 7: Testing & Deployment (Day 8-9)

### 7.1 Manual Testing Checklist

**Customer Flow**:
- [ ] Browse posts on homepage
- [ ] Click into post detail
- [ ] Fill and submit application form
- [ ] Verify success message
- [ ] Verify duplicate prevention (submit again)
- [ ] Verify form hidden for expired posts

**Operator Flow**:
- [ ] Login at `/operator/login`
- [ ] See dashboard with stats
- [ ] View assigned requests in queue
- [ ] Update request status
- [ ] Add notes and message
- [ ] Click WhatsApp/Call buttons
- [ ] Mark request as completed
- [ ] Logout

**Admin Flow**:
- [ ] Login at `/admin/login`
- [ ] See updated dashboard stats (with request counts)
- [ ] View all customer requests tab
- [ ] Filter and search requests
- [ ] Reassign request to different operator
- [ ] Create operator with password
- [ ] Reset operator password
- [ ] Verify operator login works with new credentials

**Edge Cases**:
- [ ] Submit form with no active operators → error message
- [ ] Deactivated operator cannot login → 403 error
- [ ] Expired token → redirect to login
- [ ] Admin tries operator routes → redirect
- [ ] Operator tries admin routes → redirect
- [ ] Invalid phone number → validation error
- [ ] Missing required fields → validation error

### 7.2 Deployment
- [ ] Update backend `.env` with any new variables
- [ ] Push changes to Git
- [ ] Deploy backend to Vercel
- [ ] Deploy frontend to Vercel
- [ ] Run seed script if needed
- [ ] Verify health check endpoint
- [ ] Create test admin and operator accounts
- [ ] Submit test customer request

---

## Estimated Timeline

| Phase | Description              | Duration  | Dependencies |
|-------|--------------------------|-----------|--------------|
| 1     | Backend Foundation       | 2 days    | None         |
| 2     | Frontend Auth            | 1 day     | Phase 1      |
| 3     | Customer Form            | 1-2 days  | Phase 1, 2   |
| 4     | Operator Portal          | 2-3 days  | Phase 1, 2   |
| 5     | Admin Request Management | 1-2 days  | Phase 1, 4   |
| 6     | Polish & Security        | 1 day     | All above    |
| 7     | Testing & Deployment     | 1 day     | All above    |
|       | **TOTAL**                | **8-11 days** |          |

---

## File Change Summary

### New Files (10)
```
backend/
  models/CustomerRequest.js
  models/AssignmentCounter.js
  routes/customerRequests.js

frontend/src/
  components/CustomerApplicationForm.jsx
  components/RequestCard.jsx
  components/AdminRoute.jsx
  components/OperatorRoute.jsx
  pages/OperatorLogin.jsx
  pages/OperatorDashboard.jsx
  pages/CustomerRequestsAdmin.jsx
```

### Modified Files (10)
```
backend/
  models/Admin.js              (add role field)
  models/Operator.js           (add password, role, stats fields)
  middleware/auth.js            (add authorize, enhance protect)
  routes/auth.js               (add operator login)
  routes/posts.js              (add authorize middleware)
  routes/operator.js           (add authorize, password handling)
  server.js                    (mount new routes)

frontend/src/
  context/AuthContext.jsx       (role-based auth)
  App.jsx                       (new routes)
  pages/AdminDashboard.jsx      (new tab, stats)
  pages/ManageOperator.jsx      (password field)
  pages/PostDetailPage.jsx      (application form)
  locales/en/translation.json   (new translations)
```
