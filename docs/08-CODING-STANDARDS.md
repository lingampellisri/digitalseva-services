# Coding Standards & Project Conventions

> Industry-standard coding practices for the Digital Seva project.

---

## 1. File & Directory Naming

| Type           | Convention          | Example                      |
|----------------|---------------------|------------------------------|
| React Pages    | PascalCase `.jsx`   | `AdminDashboard.jsx`         |
| React Components | PascalCase `.jsx` | `CustomerApplicationForm.jsx`|
| Backend Models | PascalCase `.js`    | `CustomerRequest.js`         |
| Backend Routes | camelCase `.js`     | `customerRequests.js`        |
| Middleware     | camelCase `.js`     | `auth.js`                    |
| CSS Files      | kebab-case `.css`   | `index.css`                  |
| Config Files   | camelCase `.js`     | `db.js`                      |
| Translations   | camelCase `.json`   | `translation.json`           |

---

## 2. JavaScript / React Conventions

### Components
```jsx
// Functional components only (no class components)
const ComponentName = ({ prop1, prop2 }) => {
    // State declarations first
    const [state, setState] = useState(initialValue);

    // Effects next
    useEffect(() => {
        // Effect logic
    }, [dependencies]);

    // Helper functions
    const handleAction = () => { ... };

    // Render
    return (
        <div className="component-wrapper">
            ...
        </div>
    );
};

export default ComponentName;
```

### Imports Order
```javascript
// 1. React & core libraries
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 2. Third-party libraries
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2 } from 'react-icons/fi';

// 3. Internal context & hooks
import { useAuth } from '../context/AuthContext';

// 4. Internal components
import RequestCard from '../components/RequestCard';

// 5. API & utilities
import API from '../api/client';
```

### State Management
- Use React Context for global state (auth, theme)
- Use local `useState` for component-level state
- No Redux — project is not complex enough to warrant it
- Keep API calls in page-level components, pass data down as props

---

## 3. Backend Conventions

### Route Handler Structure
```javascript
// @route   METHOD /api/resource/action
// @desc    Brief description
// @access  Public | Admin | Operator | Admin+Operator
router.method('/path', middleware1, middleware2, async (req, res) => {
    try {
        // 1. Validate input
        // 2. Business logic
        // 3. Return response
        res.status(200).json({ data, message: 'Success' });
    } catch (err) {
        console.error(`[Route Name] Error:`, err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
```

### Error Response Format
```json
{
    "message": "Human-readable error message",
    "errors": [
        { "field": "email", "message": "Invalid email format" }
    ]
}
```

### Model Naming
- Schema variable: `PascalCaseSchema` (e.g., `CustomerRequestSchema`)
- Model export: `mongoose.model('PascalCase', schema)`
- Collection: auto-pluralized by Mongoose (e.g., `customerrequests`)

---

## 4. CSS Conventions

### Class Naming Pattern
```
Component: .component-name
Modifier:  .component-name-variant
Child:     .component-child
State:     .component-name.active / .component-name.loading
```

### Examples
```css
.request-card { }
.request-card-compact { }
.request-card .request-status { }
.request-card.active { }
```

### CSS Custom Properties (already established)
```css
:root {
    --accent-blue: #00b4d8;
    --text-dark: #1e293b;
    --text-muted: #64748b;
    --bg-light: #f8fafc;
    --border-color: #e2e8f0;
    /* Add new as needed */
}
```

---

## 5. API Client Usage

```javascript
// Always use the centralized API client
import API from '../api/client';

// GET
const res = await API.get('/customer-requests?status=assigned');

// POST
const res = await API.post('/customer-requests', { name, phone, postId });

// PUT
const res = await API.put(`/customer-requests/${id}`, { status, notes });

// DELETE
const res = await API.delete(`/customer-requests/${id}`);
```

---

## 6. i18n Translation Keys

### Namespace Pattern
```json
{
    "featureName": {
        "title": "...",
        "subtitle": "...",
        "fieldLabel": "...",
        "buttonText": "...",
        "errorMessage": "...",
        "successMessage": "..."
    }
}
```

### New Namespace for Customer Requests
```json
{
    "applicationForm": {
        "title": "Apply for This Service",
        "name": "Full Name",
        "age": "Age",
        "phone": "Phone Number",
        "email": "Email Address",
        "message": "Additional Message",
        "submit": "Submit Application",
        "success": "Application submitted successfully!",
        "error": "Failed to submit. Please try again.",
        "privacy": "Your information is secure and private."
    },
    "operatorDashboard": {
        "title": "Operator Dashboard",
        "myQueue": "My Queue",
        "profile": "Profile",
        "totalRequests": "Total Requests",
        "activeRequests": "Active",
        "completedRequests": "Completed",
        "todayRequests": "Today"
    },
    "requestStatus": {
        "pending": "Pending",
        "assigned": "Assigned",
        "in_progress": "In Progress",
        "contacted": "Contacted",
        "completed": "Completed",
        "rejected": "Rejected",
        "cancelled": "Cancelled"
    }
}
```

---

## 7. Git Conventions

### Branch Naming
```
feature/customer-request-form
feature/operator-dashboard
feature/rbac-auth
fix/assignment-counter
refactor/auth-middleware
```

### Commit Messages
```
feat: add customer application form component
feat: implement round-robin operator assignment
fix: prevent duplicate request submission
refactor: enhance auth middleware with role-based access
style: add operator dashboard responsive styles
docs: add project documentation
```

---

## 8. Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-super-secure-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Production
```env
# Vercel environment variables (set via dashboard)
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## 9. Security Checklist

- [ ] Never store plain-text passwords
- [ ] Always hash passwords with bcrypt (salt rounds: 10)
- [ ] Never return password fields in API responses
- [ ] Validate all inputs server-side (never trust client)
- [ ] Use CORS whitelist (only allow frontend origin)
- [ ] JWT tokens expire after 7 days
- [ ] Protected routes require valid JWT
- [ ] Role-based middleware enforces access control
- [ ] MongoDB injection prevented by Mongoose schema validation
- [ ] Sensitive config in environment variables, never in code
