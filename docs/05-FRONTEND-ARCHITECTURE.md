# Frontend Architecture & UI Components

> Component hierarchy, page designs, and UI flow for all three user roles.

---

## 1. Component Hierarchy

```
App.jsx
├── AuthProvider (Context)
├── Router
│   ├── PublicLayout
│   │   ├── SecurityBanner (marquee)
│   │   ├── Navbar
│   │   ├── HomePage                          (existing)
│   │   │   ├── HeroSection
│   │   │   ├── TrustBadges
│   │   │   ├── LiveCounter
│   │   │   ├── WhatsNewSidebar
│   │   │   ├── SevaFamilyCard
│   │   │   ├── PostCard (grid)
│   │   │   └── Footer
│   │   ├── PostDetailPage                    (enhanced)
│   │   │   ├── PostHero
│   │   │   ├── CountdownTimer
│   │   │   ├── RequiredDocs
│   │   │   ├── ExtraInfo
│   │   │   ├── OperatorCard
│   │   │   └── **CustomerApplicationForm**   ← NEW
│   │   └── 404 Page
│   │
│   ├── /admin/login → AdminLogin             (existing)
│   ├── /admin → AdminRoute                   (enhanced)
│   │   └── AdminDashboard
│   │       ├── Sidebar (nav)
│   │       ├── DashboardView (stats)
│   │       ├── PostForm (add/edit)
│   │       ├── ManageOperator (CRUD)
│   │       └── **CustomerRequestsAdmin**     ← NEW
│   │
│   ├── /operator/login → **OperatorLogin**   ← NEW
│   └── /operator → OperatorRoute             ← NEW
│       └── **OperatorDashboard**
│           ├── Sidebar (nav)
│           ├── **StatsOverview**
│           ├── **RequestQueue**
│           │   ├── **RequestCard**
│           │   └── **RequestDetailModal**
│           └── **ProfileSettings**
│
└── FloatingWhatsApp (global)
```

---

## 2. New Pages & Components

### 2.1 CustomerApplicationForm (Public)

**Location**: `src/components/CustomerApplicationForm.jsx`
**Placed on**: PostDetailPage (right column or below operator card)

#### Purpose
Allows any visitor to submit their details (name, age, phone, email, message) to apply for a specific service. The form auto-attaches the current post's ID.

#### Design
```
┌──────────────────────────────────────────┐
│  📝 Apply for This Service               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Full Name *                        │  │
│  └────────────────────────────────────┘  │
│  ┌───────────────┐ ┌────────────────┐    │
│  │ Age           │ │ Phone *         │    │
│  └───────────────┘ └────────────────┘    │
│  ┌────────────────────────────────────┐  │
│  │ Email                              │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Service: [Dropdown - auto-filled]  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Message (optional)                 │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [ Submit Application ]                  │
│                                          │
│  🔒 Your information is secure & private │
└──────────────────────────────────────────┘
```

#### Fields
| Field           | Type     | Required | Validation                |
|-----------------|----------|:--------:|---------------------------|
| `customerName`  | text     | ✅       | min 2 chars               |
| `customerAge`   | number   | —        | 1-150                     |
| `customerPhone` | tel      | ✅       | 10 digits, starts with 6-9|
| `customerEmail` | email    | —        | Valid email format         |
| `customerMessage` | textarea | —     | max 1000 chars            |
| `postId`        | hidden   | ✅       | Auto from route           |

#### States
- **Default**: Empty form with validation hints
- **Loading**: Spinner on submit button
- **Success**: "✅ Application submitted! An operator will contact you within 24 hours."
- **Error**: Red alert with error message

---

### 2.2 OperatorLogin Page (NEW)

**Location**: `src/pages/OperatorLogin.jsx`
**Route**: `/operator/login`

#### Design
Similar to AdminLogin but with operator branding:
```
┌──────────────────────────────────────┐
│         Digital Seva                  │
│       Operator Portal                │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📱 Phone Number               │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🔒 Password                   │  │
│  └────────────────────────────────┘  │
│                                      │
│  [ Sign In as Operator ]             │
│                                      │
│  Contact admin for credentials       │
└──────────────────────────────────────┘
```

---

### 2.3 OperatorDashboard (NEW)

**Location**: `src/pages/OperatorDashboard.jsx`
**Route**: `/operator`

#### Layout
```
┌─────────┬──────────────────────────────────────────────┐
│         │  Top Bar: "Welcome, Ravi Kumar 👋"    [Logout]│
│  SIDE   ├──────────────────────────────────────────────┤
│  BAR    │                                              │
│         │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ 📊 Dash │  │Total │ │Active│ │Done  │ │Today │        │
│ 📋 Queue│  │  45  │ │  8   │ │  34  │ │  3   │        │
│ 👤 Prof │  └──────┘ └──────┘ └──────┘ └──────┘        │
│         │                                              │
│         │  ┌──────────────────────────────────────┐    │
│         │  │ Customer Requests                     │    │
│         │  │ ┌──────────────────────────┐          │    │
│         │  │ │ Filter: [Status ▼] [Category ▼]│    │    │
│         │  │ └──────────────────────────┘          │    │
│         │  │                                       │    │
│         │  │ ┌─────────────────────────────────┐   │    │
│         │  │ │ 📋 Suresh Reddy                 │   │    │
│         │  │ │ Service: PAN Correction          │   │    │
│         │  │ │ Phone: 998877...  Status: [NEW] │   │    │
│         │  │ │ [View] [Contact] [Update Status]│   │    │
│         │  │ └─────────────────────────────────┘   │    │
│         │  │ ┌─────────────────────────────────┐   │    │
│         │  │ │ 📋 Lakshmi Devi                 │   │    │
│         │  │ │ Service: Aadhaar Update          │   │    │
│         │  │ │ Phone: 987654...  Status: [WIP] │   │    │
│         │  │ │ [View] [Contact] [Update Status]│   │    │
│         │  │ └─────────────────────────────────┘   │    │
│         │  └──────────────────────────────────────┘    │
│ [Logout]│                                              │
└─────────┴──────────────────────────────────────────────┘
```

#### Sidebar Navigation
| Item       | Icon | Description                    |
|------------|------|--------------------------------|
| Dashboard  | 📊   | Stats overview + recent        |
| My Queue   | 📋   | All assigned customer requests |
| Profile    | 👤   | View/edit own profile          |

---

### 2.4 RequestCard Component (NEW)

**Location**: `src/components/RequestCard.jsx`

Used in both Admin and Operator dashboards to display customer requests.

```
┌─────────────────────────────────────────────────┐
│  ┌──┐  Suresh Reddy             [●] ASSIGNED    │
│  │SR│  📱 +91 99887 76655                       │
│  └──┘  ✉️ suresh@gmail.com                      │
│                                                  │
│  Service: PAN Card Correction 2026               │
│  Category: 🪪 PAN Card                          │
│  Applied: Sep 10, 2026 at 2:30 PM               │
│                                                  │
│  Message: "I need help with PAN card correction" │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ Status: [Dropdown ▼]                      │    │
│  │ assigned | in_progress | contacted | done │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ Operator Notes (internal):               │    │
│  │ ___________________________________      │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ Message to Customer:                     │    │
│  │ ___________________________________      │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  [💬 WhatsApp] [📞 Call] [💾 Save Changes]       │
└─────────────────────────────────────────────────┘
```

---

### 2.5 CustomerRequestsAdmin (NEW)

**Location**: `src/pages/CustomerRequestsAdmin.jsx`
**Tab in**: AdminDashboard sidebar

Admin view of ALL customer requests across ALL operators.

#### Additional Admin Features
- **Filter by operator** — Dropdown to see specific operator's queue
- **Reassign button** — Move request to different operator
- **Bulk status update** — Select multiple requests, change status
- **Export** — Download requests as CSV (future)

---

## 3. Updated Routing Map

```jsx
<Routes>
    {/* Public */}
    <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
    </Route>

    {/* Auth */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/operator/login" element={<OperatorLogin />} />

    {/* Admin Protected */}
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

    {/* Operator Protected */}
    <Route path="/operator" element={<OperatorRoute><OperatorDashboard /></OperatorRoute>} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 4. AuthContext Enhancement

```jsx
// Enhanced state shape
{
    token: string | null,
    user: {
        id: string,
        role: 'admin' | 'operator',
        name: string,
        operatorId?: string
    } | null,
    isAdmin: boolean,
    isOperator: boolean,
    login(token),          // Decodes JWT payload
    logout(),
    loading: boolean       // Hydrating from localStorage
}
```

---

## 5. Admin Dashboard Enhancement

### New Sidebar Item

Add to existing `navItems`:
```jsx
const navItems = [
    { key: VIEWS.DASHBOARD, icon: <FiGrid />, label: 'Dashboard' },
    { key: VIEWS.ADD_POST, icon: <FiPlus />, label: 'Add Post' },
    { key: VIEWS.MANAGE_OPERATOR, icon: <FiUser />, label: 'Manage Operators' },
    { key: VIEWS.CUSTOMER_REQUESTS, icon: <FiInbox />, label: 'Customer Requests' },  // NEW
];
```

### Dashboard Stats Enhancement
Add new stat cards:
```jsx
{ icon: '📨', label: 'Total Requests', value: requestStats.total, color: '#06b6d4' },
{ icon: '🔄', label: 'Pending', value: requestStats.pending, color: '#f97316' },
{ icon: '✅', label: 'Completed', value: requestStats.completed, color: '#22c55e' },
```

---

## 6. PostDetailPage Enhancement

### Add "Apply Now" Section

Below the operator card on the right column (or as a dedicated section), add the `CustomerApplicationForm` component.

```jsx
// PostDetailPage.jsx — Right column
<div className="col-12 col-lg-4">
    <div className="detail-sidebar">
        {operator ? <OperatorCard operator={operator} /> : ...}

        {/* NEW — Application Form */}
        {active && (
            <CustomerApplicationForm
                postId={post._id}
                serviceName={post.titleEn}
                serviceCategory={post.category}
            />
        )}
    </div>
</div>
```

The form only shows when the post is **active** (not expired).

---

## 7. Responsive Breakpoints

| Breakpoint | Screen        | Layout                              |
|------------|---------------|-------------------------------------|
| < 576px    | Mobile        | Single column, stacked cards        |
| 576-768px  | Tablet        | 2 columns for cards, collapsible nav|
| 768-1024px | Small Desktop | Sidebar visible, 2-3 col grid       |
| > 1024px   | Desktop       | Full sidebar + wide content area    |

---

## 8. File Structure (New Files)

```
frontend/src/
├── components/
│   ├── CustomerApplicationForm.jsx    ← NEW
│   ├── RequestCard.jsx                ← NEW
│   ├── AdminRoute.jsx                 ← NEW (replaces ProtectedRoute)
│   ├── OperatorRoute.jsx              ← NEW
│   └── ... (existing)
├── pages/
│   ├── OperatorLogin.jsx              ← NEW
│   ├── OperatorDashboard.jsx          ← NEW
│   ├── CustomerRequestsAdmin.jsx      ← NEW
│   └── ... (existing)
└── context/
    └── AuthContext.jsx                ← ENHANCED
```
