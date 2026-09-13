# Deployment & DevOps Guide

> Production deployment, monitoring, and maintenance for Digital Seva.

---

## 1. Deployment Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   GitHub     │────────▶│   Vercel     │────────▶│  MongoDB     │
│   Repo       │  push   │   Platform   │  conn   │  Atlas       │
│              │         │              │         │  Cluster     │
│  frontend/   │         │  Frontend:   │         │              │
│  backend/    │         │  CDN + SSR   │         │  admins      │
│              │         │  Backend:    │         │  operators   │
│              │         │  Serverless  │         │  posts       │
│              │         │  Functions   │         │  customer-   │
│              │         │              │         │  requests    │
└──────────────┘         └──────────────┘         └──────────────┘
```

---

## 2. Vercel Configuration

### Root `vercel.json`
```json
{
    "version": 2,
    "builds": [
        {
            "src": "backend/server.js",
            "use": "@vercel/node"
        },
        {
            "src": "frontend/package.json",
            "use": "@vercel/static-build",
            "config": {
                "distDir": "dist"
            }
        }
    ],
    "routes": [
        { "src": "/api/(.*)", "dest": "backend/server.js" },
        { "src": "/(.*)", "dest": "frontend/$1" }
    ]
}
```

### Frontend `vercel.json`
```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```

---

## 3. Environment Variables Setup

### Vercel Dashboard Settings

Navigate to: `Project Settings → Environment Variables`

| Variable         | Value                              | Environment |
|------------------|------------------------------------|-------------|
| `MONGO_URI`      | `mongodb+srv://user:pass@...`      | Production  |
| `JWT_SECRET`     | `<64-char random string>`          | Production  |
| `ADMIN_USERNAME`  | `admin`                           | Production  |
| `ADMIN_PASSWORD`  | `<strong password>`               | Production  |
| `FRONTEND_URL`   | `https://digitalseva.vercel.app`   | Production  |
| `VITE_API_URL`   | `https://digitalseva.vercel.app/api` | Production |

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 4. MongoDB Atlas Setup

### Cluster Configuration
- **Provider**: AWS / GCP
- **Region**: ap-south-1 (Mumbai) — closest to India
- **Tier**: M0 (Free) for development, M10+ for production
- **Version**: MongoDB 7.x+

### Network Access
- Whitelist Vercel IP ranges or allow `0.0.0.0/0` (all IPs) for serverless
- Enable IP access list for security in production

### Database Users
- Create a dedicated user for the app with `readWrite` role
- Never use the admin user for application connections

### Collections (Auto-created by Mongoose)
```
digital_seva_db/
├── admins
├── operators
├── posts
├── customerrequests
└── assignmentcounters
```

---

## 5. Local Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Git

### First-time Setup
```bash
# Clone repository
git clone https://github.com/lingampellisri/DigitalSeva.git
cd DigitalSeva

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev     # Starts on http://localhost:5000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

### Development URLs
| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173         |
| Backend  | http://localhost:5000         |
| API Docs | http://localhost:5000/api/health |
| Admin    | http://localhost:5173/admin/login |
| Operator | http://localhost:5173/operator/login |

---

## 6. Build & Deploy

### Manual Deployment
```bash
# Frontend build
cd frontend
npm run build    # Creates dist/ folder

# Test production build locally
npm run preview  # Serves dist/ on localhost:4173
```

### Auto-deploy via Git
```bash
# Push to main branch triggers Vercel auto-deploy
git add .
git commit -m "feat: add operator dashboard"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Installs dependencies
# 3. Builds frontend
# 4. Deploys serverless functions (backend)
# 5. Routes traffic to new version
```

---

## 7. Initial Data Seeding

### Admin User (Auto-seeded)
The system auto-creates an admin user on first database connection if none exists.

### Create Test Operators (via Admin Dashboard or API)
```bash
# Using curl
curl -X POST http://localhost:5000/api/operators \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Test Operator 1",
    "phone": "9876543210",
    "password": "operator123",
    "email": "op1@test.com",
    "isActive": true
  }'
```

### Seed Script (Optional)
```javascript
// backend/scripts/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const Operator = require('../models/Operator');
const connectDB = require('../config/db');

const seedOperators = async () => {
    await connectDB();

    const operators = [
        { name: 'Ravi Kumar', phone: '9876543210', password: 'op123', isActive: true },
        { name: 'Sita Devi', phone: '9876543211', password: 'op123', isActive: true },
        { name: 'Arjun Reddy', phone: '9876543212', password: 'op123', isActive: true },
    ];

    for (const op of operators) {
        const exists = await Operator.findOne({ phone: op.phone });
        if (!exists) await Operator.create(op);
    }

    console.log('Operators seeded!');
    process.exit(0);
};

seedOperators();
```

---

## 8. Monitoring & Debugging

### Health Check Endpoint
```
GET /api/health
Response: { "status": "ok", "message": "ANTIGRAVITY API running" }
```

### Vercel Logs
- Access via: `Vercel Dashboard → Project → Deployments → Logs`
- Real-time function execution logs
- Error tracking and performance metrics

### MongoDB Atlas Monitoring
- Access via: `Atlas Dashboard → Cluster → Monitoring`
- Track query performance
- Monitor connection count
- Set alerts for high latency

### Recommended Additions (Future)
| Tool           | Purpose                      |
|----------------|------------------------------|
| Sentry         | Error tracking & alerting    |
| Vercel Analytics | Performance monitoring    |
| MongoDB Profiler | Slow query detection      |
| UptimeRobot    | Uptime monitoring (free)     |

---

## 9. Backup Strategy

### MongoDB Atlas Backups
- **M0 (Free)**: No automated backups — manual export
- **M10+**: Automated continuous backups
- **Point-in-time recovery**: Available on M10+

### Manual Backup
```bash
# Export using mongodump
mongodump --uri "mongodb+srv://..." --out ./backup/$(date +%Y%m%d)

# Export specific collection
mongoexport --uri "mongodb+srv://..." --collection customerrequests --out requests.json
```

---

## 10. Scaling Considerations

| Concern          | Current       | Recommendation for Scale        |
|------------------|---------------|---------------------------------|
| Database         | M0 (Free)     | Upgrade to M10+ with replicas   |
| Backend          | Serverless    | Serverless scales automatically  |
| Frontend         | Static CDN    | Already globally distributed    |
| File Storage     | Google Drive  | Move to S3/Cloudinary           |
| Rate Limiting    | None          | Add express-rate-limit           |
| Caching          | None          | Add Redis for sessions/counters |
| Search           | MongoDB text  | Add Elasticsearch for full-text |
