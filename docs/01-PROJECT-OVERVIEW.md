# Digital Seva — Project Overview

> **Version**: 2.0 (Industry Standard Upgrade)
> **Last Updated**: September 2026
> **Project Type**: Full-Stack SaaS — Government & Private Services Portal

---

## 1. Project Vision

**Digital Seva** is a bilingual (English + Telugu) online services platform that connects citizens with verified operators who help them apply for government schemes, jobs, PAN cards, Aadhaar services, scholarships, and more.

### Business Model
```
Customer → Browses Services → Submits Application Request
                                      ↓
              System auto-assigns to Operator (Round-Robin / Random)
                                      ↓
              Operator contacts Customer → Handles application → Marks complete
                                      ↓
              Admin monitors everything → Manages operators & posts
```

---

## 2. Current Architecture

### Tech Stack

| Layer       | Technology                         | Version   |
|-------------|------------------------------------|-----------|
| Frontend    | React (Vite)                       | React 19  |
| Styling     | Vanilla CSS + Bootstrap 5          | 5.3.8     |
| Routing     | React Router DOM                   | 7.13      |
| HTTP Client | Axios                              | 1.13.5    |
| i18n        | react-i18next                      | 16.5.4    |
| Icons       | react-icons (Feather + FontAwesome)| 5.5.0     |
| Backend     | Express.js                         | 5.2.1     |
| Database    | MongoDB (Mongoose ODM)             | 9.2.1     |
| Auth        | JWT (jsonwebtoken)                 | 9.0.3     |
| Password    | bcryptjs                           | 3.0.3     |
| Hosting     | Vercel (Frontend + Backend)        | —         |

### Repository Structure
```
Online-service-reactApp/
├── frontend/                    # Vite + React SPA
│   ├── src/
│   │   ├── api/client.js        # Axios instance with auth interceptor
│   │   ├── components/          # Shared UI components (12 files)
│   │   ├── context/AuthContext.jsx  # Auth state management
│   │   ├── locales/en/          # i18n translation files
│   │   ├── pages/               # Route-level page components (6 files)
│   │   ├── App.jsx              # Root component + routing
│   │   ├── index.css            # Global styles (~63KB)
│   │   └── main.jsx             # Entry point
│   └── vite.config.js
├── backend/                     # Express REST API
│   ├── config/db.js             # MongoDB connection + admin seeding
│   ├── middleware/auth.js       # JWT verification middleware
│   ├── models/                  # Mongoose schemas (3 models)
│   │   ├── Admin.js
│   │   ├── Operator.js
│   │   └── Post.js
│   ├── routes/                  # Express route handlers
│   │   ├── auth.js              # Login + initial setup
│   │   ├── posts.js             # CRUD for service posts
│   │   └── operator.js          # CRUD for operators
│   └── server.js                # Express app entry
└── vercel.json                  # Deployment config
```

---

## 3. Current State Analysis

### ✅ What Already Exists

| Feature                   | Status  | Notes                                    |
|---------------------------|---------|------------------------------------------|
| Public homepage           | ✅ Done | Hero, trust badges, live counter, posts  |
| Service post listing      | ✅ Done | Category filter, search, active/expired  |
| Post detail page          | ✅ Done | Countdown timer, docs, operator card     |
| Admin login               | ✅ Done | JWT-based, single admin role             |
| Admin dashboard           | ✅ Done | Stats, post CRUD, operator management    |
| Operator management       | ✅ Done | Add/edit/delete/toggle active operators  |
| Bilingual support         | ✅ Done | English + Telugu via i18n                |
| Dark mode                 | ✅ Done | CSS variable-based theme switching       |
| WhatsApp integration      | ✅ Done | Floating button, group links             |
| Responsive design         | ✅ Done | Mobile-first CSS                         |

### ❌ What's Missing (To Be Built)

| Feature                                | Priority  | Complexity |
|----------------------------------------|-----------|------------|
| **Role-based access (Admin/Operator)** | 🔴 High   | High       |
| **Operator login system**              | 🔴 High   | Medium     |
| **Customer application form**          | 🔴 High   | Medium     |
| **CustomerRequest model + API**        | 🔴 High   | Medium     |
| **Random request distribution**        | 🔴 High   | Medium     |
| **Operator dashboard**                 | 🔴 High   | High       |
| **Request status tracking**            | 🟡 Medium | Medium     |
| **Admin request overview**             | 🟡 Medium | Medium     |
| **Email/WhatsApp notifications**       | 🟢 Low    | Low        |
| **Audit logging**                      | 🟢 Low    | Low        |

---

## 4. Deployment Architecture

```
┌─────────────────────┐     ┌─────────────────────────┐
│   Vercel (Frontend)  │────▶│   Vercel (Backend API)  │
│   React SPA          │     │   Express.js            │
│   Static Assets      │     │   /api/* routes         │
└─────────────────────┘     └──────────┬──────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │   MongoDB Atlas      │
                            │   Cloud Database     │
                            └─────────────────────┘
```

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<secure-random-string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure-password>
FRONTEND_URL=https://your-domain.vercel.app
```

---

## 5. Key Design Principles

1. **Bilingual First** — Every user-facing string goes through i18n (English + Telugu)
2. **Mobile-First** — CSS designed for mobile, scales up to desktop
3. **Operator-Centric** — Operators are the revenue drivers; UX must support them
4. **Zero-Trust Auth** — JWT on every protected request, role-based middleware
5. **Auto-Seeding** — Admin user auto-created on first DB connection
6. **Google Drive Compat** — Image URLs auto-converted to Drive preview format
