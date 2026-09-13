# API Reference — Complete REST API Documentation

> Industry-standard RESTful API design for Digital Seva platform.

---

## Base URL
```
Development: http://localhost:5000/api
Production:  https://your-backend.vercel.app/api
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format
```json
// Success
{ "data": {...}, "message": "Success" }

// Error
{ "message": "Error description", "errors": [...] }
```

## Status Codes
| Code | Meaning              |
|------|----------------------|
| 200  | Success              |
| 201  | Created              |
| 400  | Bad Request          |
| 401  | Unauthorized         |
| 403  | Forbidden (wrong role)|
| 404  | Not Found            |
| 422  | Validation Error     |
| 500  | Internal Server Error|

---

## 1. Authentication Endpoints

### POST `/auth/login` — Admin Login

**Access**: Public

```json
// Request
{
    "username": "admin",
    "password": "Admin@1234"
}

// Response 200
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "role": "admin",
    "username": "admin"
}

// Response 401
{ "message": "Invalid credentials" }
```

---

### POST `/auth/operator/login` — Operator Login (NEW)

**Access**: Public

```json
// Request
{
    "phone": "+919876543210",
    "password": "operator_password"
}

// Response 200
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "role": "operator",
    "operatorId": "66e2abc123456789",
    "name": "Ravi Kumar"
}

// Response 401
{ "message": "Invalid phone or password" }

// Response 403
{ "message": "Account is deactivated. Contact admin." }
```

---

### POST `/auth/setup` — First-time Admin Setup

**Access**: Public (disable after use)

```json
// Response 201
{ "message": "Admin created", "username": "admin" }

// Response 400
{ "message": "Admin already exists" }
```

---

## 2. Post Endpoints (Existing)

### GET `/posts` — List All Posts

**Access**: Public

```
Query Params:
  ?category=job        (optional filter)
  ?page=1&limit=20     (optional pagination — future)
```

```json
// Response 200
[
    {
        "_id": "66e2abc123456789",
        "titleEn": "APPSC Group 1 Notification 2026",
        "titleTe": "APPSC గ్రూప్ 1 నోటిఫికేషన్ 2026",
        "imageUrl": "https://drive.google.com/file/d/xxx/preview",
        "startDate": "2026-09-01T00:00:00.000Z",
        "endDate": "2026-10-30T00:00:00.000Z",
        "requiredDocsEn": ["Aadhaar Card", "Degree Certificate"],
        "requiredDocsTe": ["ఆధార్ కార్డు", "డిగ్రీ సర్టిఫికేట్"],
        "extraInfoEn": "Age limit: 18-42",
        "extraInfoTe": "వయో పరిమితి: 18-42",
        "category": "job",
        "notificationUrl": "https://example.com/notification",
        "createdAt": "2026-09-01T12:00:00.000Z",
        "updatedAt": "2026-09-01T12:00:00.000Z"
    }
]
```

---

### GET `/posts/:id` — Get Single Post

**Access**: Public

```json
// Response 200 — Single post object (same as above)

// Response 404
{ "message": "Post not found" }
```

---

### POST `/posts` — Create Post

**Access**: Admin only (`protect` + `authorize('admin')`)

```json
// Request
{
    "titleEn": "Railway Recruitment 2026",
    "titleTe": "రైల్వే నియామకం 2026",
    "category": "job",
    "startDate": "2026-09-15",
    "endDate": "2026-11-15",
    "imageUrl": "https://example.com/image.jpg",
    "requiredDocsEn": ["Aadhaar", "10th Certificate"],
    "requiredDocsTe": ["ఆధార్", "10వ సర్టిఫికేట్"],
    "extraInfoEn": "Must be 18+",
    "extraInfoTe": "18+ ఉండాలి",
    "notificationUrl": "https://rrbapply.gov.in"
}

// Response 201 — Created post object
```

---

### PUT `/posts/:id` — Update Post

**Access**: Admin only

```json
// Request — Partial or full update
{
    "titleEn": "Updated Title",
    "endDate": "2026-12-31"
}

// Response 200 — Updated post object
```

---

### DELETE `/posts/:id` — Delete Post

**Access**: Admin only

```json
// Response 200
{ "message": "Post deleted" }
```

---

## 3. Operator Endpoints (Enhanced)

### GET `/operators` — List Active Operators

**Access**: Public

```json
// Response 200 — Array of active operators (sorted by sortOrder)
// NOTE: Password field is NEVER returned
[
    {
        "_id": "66e2abc123456789",
        "name": "Ravi Kumar",
        "phone": "+919876543210",
        "email": "ravi@example.com",
        "age": 30,
        "photoUrl": "https://example.com/photo.jpg",
        "whatsapp": "+919876543210",
        "bio": "5 years experience in government services",
        "isActive": true,
        "sortOrder": 0
    }
]
```

---

### GET `/operators/all` — List All Operators (Including Inactive)

**Access**: Admin only

```json
// Response 200 — Array of all operators with stats
[
    {
        ...operatorFields,
        "totalAssigned": 45,
        "totalCompleted": 38,
        "lastAssignedAt": "2026-09-10T14:30:00.000Z"
    }
]
```

---

### POST `/operators` — Create Operator (Enhanced)

**Access**: Admin only

```json
// Request
{
    "name": "Ravi Kumar",
    "phone": "+919876543210",
    "password": "operator123",     // NEW — will be bcrypt hashed
    "email": "ravi@example.com",
    "age": 30,
    "address": "Hyderabad, Telangana",
    "photoUrl": "https://example.com/photo.jpg",
    "whatsapp": "+919876543210",
    "whatsappGroupLink": "https://chat.whatsapp.com/abc",
    "bio": "Experienced service operator"
}

// Response 201 — Created operator (no password in response)
```

---

### PUT `/operators/:id` — Update Operator

**Access**: Admin only

```json
// Request — Partial update
{
    "name": "Ravi Kumar Updated",
    "bio": "Updated bio"
}

// Response 200 — Updated operator
```

---

### PATCH `/operators/:id/toggle` — Toggle Active Status

**Access**: Admin only

```json
// Response 200 — Updated operator with toggled isActive
```

---

### PATCH `/operators/:id/reset-password` — Reset Operator Password (NEW)

**Access**: Admin only

```json
// Request
{ "newPassword": "newPassword123" }

// Response 200
{ "message": "Password reset successfully" }
```

---

### DELETE `/operators/:id` — Delete Operator

**Access**: Admin only

```json
// Response 200
{ "message": "Operator deleted successfully" }
```

---

## 4. Customer Request Endpoints (NEW)

### POST `/customer-requests` — Submit Application Request

**Access**: Public (any customer)

```json
// Request
{
    "customerName": "Suresh Reddy",
    "customerAge": 25,
    "customerPhone": "+919988776655",
    "customerEmail": "suresh@gmail.com",
    "customerMessage": "I need help with PAN card correction",
    "postId": "66e2abc123456789"
}

// Response 201
{
    "message": "Request submitted successfully! An operator will contact you shortly.",
    "request": {
        "_id": "66e2def987654321",
        "customerName": "Suresh Reddy",
        "serviceName": "PAN Card Correction 2026",
        "status": "assigned",
        "assignedTo": {
            "name": "Ravi Kumar",
            "phone": "+919876543210"
        }
    }
}

// Response 400
{ "message": "Name and phone are required" }

// Response 404
{ "message": "Service post not found" }
```

**Server-side Logic**:
1. Validate required fields (name, phone, postId)
2. Fetch Post → extract serviceName and category
3. Find all active operators
4. Apply **round-robin** assignment algorithm
5. Create CustomerRequest with `status: 'assigned'`
6. Update operator counters
7. Return success with assignment info

---

### GET `/customer-requests` — List All Requests (Admin)

**Access**: Admin only

```
Query Params:
  ?status=pending              (filter by status)
  ?assignedTo=operatorId       (filter by operator)
  ?category=job                (filter by service category)
  ?search=suresh               (search by customer name/phone)
  ?page=1&limit=20             (pagination)
  ?sort=createdAt&order=desc   (sorting)
```

```json
// Response 200
{
    "requests": [
        {
            "_id": "66e2def987654321",
            "customerName": "Suresh Reddy",
            "customerPhone": "+919988776655",
            "customerEmail": "suresh@gmail.com",
            "serviceName": "PAN Card Correction 2026",
            "serviceCategory": "pan",
            "status": "assigned",
            "priority": "normal",
            "assignedTo": {
                "_id": "66e2abc123456789",
                "name": "Ravi Kumar",
                "phone": "+919876543210"
            },
            "postId": {
                "_id": "66e2...",
                "titleEn": "PAN Card Correction 2026"
            },
            "operatorNotes": "",
            "operatorMessage": "",
            "statusHistory": [
                {
                    "status": "pending",
                    "timestamp": "2026-09-10T14:30:00.000Z"
                },
                {
                    "status": "assigned",
                    "changedBy": "system",
                    "timestamp": "2026-09-10T14:30:01.000Z",
                    "note": "Auto-assigned to Ravi Kumar"
                }
            ],
            "createdAt": "2026-09-10T14:30:00.000Z"
        }
    ],
    "pagination": {
        "total": 156,
        "page": 1,
        "limit": 20,
        "totalPages": 8
    }
}
```

---

### GET `/customer-requests/mine` — Operator's Assigned Requests (NEW)

**Access**: Operator only

```
Query Params:
  ?status=assigned             (filter by status)
  ?page=1&limit=20             (pagination)
```

```json
// Response 200
{
    "requests": [...],     // Same shape as admin response
    "stats": {
        "total": 45,
        "pending": 3,
        "inProgress": 8,
        "completed": 34
    },
    "pagination": {...}
}
```

---

### GET `/customer-requests/:id` — Get Single Request

**Access**: Admin or Assigned Operator

```json
// Response 200 — Full request with populated references

// Response 403 — Operator trying to access someone else's request
{ "message": "Access denied: This request is not assigned to you" }
```

---

### PUT `/customer-requests/:id` — Update Request (Status, Notes, Message)

**Access**: Admin or Assigned Operator

```json
// Request — Operator updates status & adds message
{
    "status": "contacted",
    "operatorNotes": "Called customer, documents verified",
    "operatorMessage": "We've received your documents. Processing will take 3-5 days."
}

// Response 200 — Updated request

// Auto-actions on status change:
//   "completed" → Sets completedAt, increments operator.totalCompleted
//   "rejected"  → Adds rejection note to history
```

---

### PUT `/customer-requests/:id/reassign` — Reassign to Different Operator (NEW)

**Access**: Admin only

```json
// Request
{
    "newOperatorId": "66e2xyz...",
    "reason": "Previous operator unavailable"
}

// Response 200
{ "message": "Request reassigned successfully" }
```

---

### GET `/customer-requests/stats` — Dashboard Statistics (NEW)

**Access**: Admin or Operator

```json
// Admin Response 200
{
    "total": 156,
    "byStatus": {
        "pending": 5,
        "assigned": 12,
        "in_progress": 23,
        "contacted": 15,
        "completed": 95,
        "rejected": 4,
        "cancelled": 2
    },
    "byCategory": {
        "pan": 45,
        "aadhaar": 30,
        "job": 50,
        "scholarship": 20,
        "other": 11
    },
    "todayCount": 8,
    "thisWeekCount": 34,
    "thisMonthCount": 89
}

// Operator Response 200 (filtered to own requests)
{
    "total": 45,
    "byStatus": {...},
    "todayCount": 3,
    "thisWeekCount": 12
}
```

---

## 5. Health Check

### GET `/health` — API Status

**Access**: Public

```json
{ "status": "ok", "message": "ANTIGRAVITY API running" }
```

---

## 6. Assignment Algorithm

### Round-Robin Distribution

```javascript
async function assignOperator() {
    // 1. Get all active operators sorted by sortOrder
    const operators = await Operator.find({ isActive: true })
        .sort({ sortOrder: 1 });

    if (operators.length === 0) return null;

    // 2. Get (or create) the assignment counter
    let counter = await AssignmentCounter.findOne({});
    if (!counter) {
        counter = await AssignmentCounter.create({
            lastAssignedIndex: -1,
            totalRequests: 0
        });
    }

    // 3. Round-robin: pick next operator
    const nextIndex = (counter.lastAssignedIndex + 1) % operators.length;
    const selectedOperator = operators[nextIndex];

    // 4. Update counter
    counter.lastAssignedIndex = nextIndex;
    counter.totalRequests += 1;
    await counter.save();

    // 5. Update operator stats
    selectedOperator.totalAssigned += 1;
    selectedOperator.lastAssignedAt = new Date();
    await selectedOperator.save();

    return selectedOperator;
}
```

### Why Round-Robin Over Random?
| Approach      | Pros                           | Cons                        |
|---------------|--------------------------------|-----------------------------|
| **Random**    | Simple, unpredictable          | Uneven load distribution    |
| **Round-Robin** | Fair, even distribution      | Predictable pattern         |
| **Weighted**  | Accounts for operator capacity | Complex to implement        |

**Recommendation**: Start with Round-Robin for fairness. Add weighted distribution later based on operator performance metrics.
