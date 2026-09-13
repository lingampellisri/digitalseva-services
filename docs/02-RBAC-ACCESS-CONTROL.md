# Role-Based Access Control (RBAC) — System Design

> Industry-standard access control with Admin, Operator, and Customer (public) roles.

---

## 1. Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                         │
│  Full system control. Manages operators, posts, all data │
├─────────────────────────────────────────────────────────┤
│                       OPERATOR                           │
│  Assigned customer requests. Can view/update own queue   │
├─────────────────────────────────────────────────────────┤
│                       CUSTOMER                           │
│  Public. Browses posts. Submits application requests     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Permission Matrix

| Resource / Action              | Customer (Public) | Operator         | Admin            |
|--------------------------------|:-----------------:|:----------------:|:----------------:|
| Browse posts                   | ✅                | ✅               | ✅               |
| View post details              | ✅                | ✅               | ✅               |
| Submit application request     | ✅                | ❌               | ❌               |
| Login                          | ❌                | ✅               | ✅               |
| View assigned requests         | ❌                | ✅ (own only)    | ✅ (all)         |
| Update request status          | ❌                | ✅ (own only)    | ✅ (all)         |
| Add custom message to request  | ❌                | ✅ (own only)    | ✅ (all)         |
| Create/edit/delete posts       | ❌                | ❌               | ✅               |
| Create/edit/delete operators   | ❌                | ❌               | ✅               |
| View all operators             | ❌                | ❌               | ✅               |
| View analytics/stats           | ❌                | ✅ (own stats)   | ✅ (all stats)   |
| Reassign requests              | ❌                | ❌               | ✅               |

---

## 3. Authentication Flow

### 3.1 Admin Login (Existing — Enhanced)

```
POST /api/auth/login
Body: { username, password }
Response: { token, role: "admin", username }
```

- Admin credentials stored in `Admin` model (bcrypt-hashed)
- JWT payload: `{ id, role: "admin" }`
- Token expiry: 7 days

### 3.2 Operator Login (NEW)

```
POST /api/auth/operator/login
Body: { phone, password }
Response: { token, role: "operator", operatorId, name }
```

- Operators authenticate with **phone + password**
- Password field added to Operator model (bcrypt-hashed)
- JWT payload: `{ id, role: "operator", operatorId }`
- Token expiry: 7 days

### 3.3 Customer (No Login Required)
- Public users — no authentication needed
- Can submit application requests without an account

---

## 4. JWT Token Structure

### Current Token
```json
{
  "id": "admin_mongo_id",
  "iat": 1726000000,
  "exp": 1726604800
}
```

### Enhanced Token (with Role)
```json
{
  "id": "user_mongo_id",
  "role": "admin | operator",
  "operatorId": "operator_mongo_id",  // only for operators
  "iat": 1726000000,
  "exp": 1726604800
}
```

---

## 5. Middleware Design

### 5.1 `protect` Middleware (Enhanced)
```
Verifies JWT token exists and is valid.
Attaches decoded user (with role) to req.user
```

### 5.2 `authorize(...roles)` Middleware (NEW)
```
authorize('admin')           → Only admins
authorize('operator')        → Only operators
authorize('admin','operator')→ Both admins and operators
```

### Implementation Pattern:
```javascript
// Backend middleware/auth.js

const protect = (req, res, next) => {
    // 1. Extract token from Authorization header
    // 2. Verify JWT
    // 3. Attach { id, role, operatorId } to req.user
    // 4. Call next()
};

const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
};
```

---

## 6. Route Protection Map

| Route                              | Middleware                        |
|------------------------------------|-----------------------------------|
| `GET  /api/posts`                  | Public                            |
| `GET  /api/posts/:id`              | Public                            |
| `POST /api/posts`                  | `protect`, `authorize('admin')`   |
| `PUT  /api/posts/:id`              | `protect`, `authorize('admin')`   |
| `DELETE /api/posts/:id`            | `protect`, `authorize('admin')`   |
| `GET  /api/operators`              | Public (active only)              |
| `GET  /api/operators/all`          | `protect`, `authorize('admin')`   |
| `POST /api/operators`              | `protect`, `authorize('admin')`   |
| `PUT  /api/operators/:id`          | `protect`, `authorize('admin')`   |
| `DELETE /api/operators/:id`        | `protect`, `authorize('admin')`   |
| `POST /api/customer-requests`      | Public (customer submission)      |
| `GET  /api/customer-requests`      | `protect`, `authorize('admin')`   |
| `GET  /api/customer-requests/mine` | `protect`, `authorize('operator')`|
| `PUT  /api/customer-requests/:id`  | `protect`, `authorize('admin','operator')` |
| `POST /api/auth/login`             | Public                            |
| `POST /api/auth/operator/login`    | Public                            |

---

## 7. Frontend Route Guards

### Current ProtectedRoute
```jsx
// Only checks if ANY token exists
const ProtectedRoute = ({ children }) => {
    const { isAdmin } = useAuth();
    if (!isAdmin) return <Navigate to="/admin/login" />;
    return children;
};
```

### Enhanced Route Guards
```jsx
// Role-specific guards
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user || user.role !== 'admin') return <Navigate to="/admin/login" />;
    return children;
};

const OperatorRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user || user.role !== 'operator') return <Navigate to="/operator/login" />;
    return children;
};
```

### Frontend Route Map
```
/                        → Public HomePage
/post/:id                → Public PostDetailPage (+ Apply Button)
/admin/login             → Admin login form
/admin                   → AdminRoute → AdminDashboard
/admin/requests          → AdminRoute → All customer requests
/operator/login          → Operator login form
/operator                → OperatorRoute → OperatorDashboard
/operator/requests       → OperatorRoute → Assigned requests queue
```

---

## 8. AuthContext Enhancement

### Current State
```javascript
{ token, isAdmin, login(), logout() }
```

### Enhanced State
```javascript
{
    token: string | null,
    user: {
        id: string,
        role: 'admin' | 'operator',
        name: string,
        operatorId?: string   // Only for operators
    } | null,
    isAdmin: boolean,         // Convenience getter
    isOperator: boolean,      // Convenience getter
    login(token, userData),
    logout()
}
```

### Token Decode on Login
```javascript
// Decode JWT payload (without verification — server already verified)
const login = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userData = {
        id: payload.id,
        role: payload.role,
        operatorId: payload.operatorId
    };
    localStorage.setItem('ag_token', token);
    localStorage.setItem('ag_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
};
```

---

## 9. Security Considerations

| Concern                | Solution                                    |
|------------------------|---------------------------------------------|
| Password storage       | bcrypt with salt rounds (10)                |
| Token exposure         | HttpOnly cookies (future), localStorage now |
| Role escalation        | Server-side role check on every request     |
| Brute force            | Rate limiting on auth endpoints (future)    |
| CORS                   | Whitelist frontend origin only              |
| Input validation       | Mongoose schema validation + express checks |
| Token refresh          | 7-day expiry, manual re-login on expire     |
