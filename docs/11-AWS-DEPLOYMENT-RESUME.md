# AWS Deployment — Resumed (Frontend on EC2, No S3, No CloudFront)
### Picking up where we left off — adding frontend to the existing EC2 server

---

## What's Already Done ✅

| Step | Status |
|------|--------|
| IAM User | ✅ Done |
| EC2 launched (Ubuntu) | ✅ Done — public IP e.g. `3.110.45.200` |
| Node.js + PM2 + Nginx installed | ✅ Done |
| Backend code deployed + PM2 running | ✅ Done |
| MongoDB Atlas whitelisted | ✅ Done |
| S3 bucket + dist/ uploaded | ✅ Done (but we won't use S3 anymore) |
| CloudFront | ❌ Blocked — skipping entirely |

---

## New Architecture — Everything on One EC2

```
INTERNET
    │
    ▼  port 80
┌──────────────────────────────────────────┐
│           AWS EC2 — Ubuntu (existing)     │
│                                           │
│   Nginx                                   │
│   ├── /         → serves React dist/      │
│   └── /api/*    → proxy → Node.js :5000   │
│                                           │
│   Node.js + Express (PM2) — already live  │
└────────────────────┬──────────────────────┘
                     │ MongoDB connection string
                     ▼
            MongoDB Atlas Cluster
```

> Your EC2 is already set up and backend is running.
> You only need to do the steps below — nothing else.

---

## STEP 1 — Update Frontend .env.production (on your laptop)

Open:
`C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend\.env.production`

Make sure it has:

```env
VITE_API_URL=http://3.110.45.200/api
```

> Replace `3.110.45.200` with your actual EC2 public IP.
> No port needed — Nginx handles port 80 and proxies `/api/*` to Node.js.

---

## STEP 2 — Build the React App (on your laptop)

```powershell
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm run build
```

Verify the output:
```powershell
ls dist
# Should show: index.html  assets/  ...
```

---

## STEP 3 — Upload dist/ to EC2

```powershell
scp -i "C:\Users\DELL\Downloads\digitalseva-key.pem" -r "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend\dist" ubuntu@3.110.45.200:~/frontend-dist
```

Wait for the upload to complete.

---

## STEP 4 — Move Files into Nginx Web Root (on EC2)

SSH into EC2:

```powershell
ssh -i "C:\Users\DELL\Downloads\digitalseva-key.pem" ubuntu@3.110.45.200
```

Then run:

```bash
# Create the web directory (if not already there)
sudo mkdir -p /var/www/digitalseva

# Copy all built files
sudo cp -r ~/frontend-dist/* /var/www/digitalseva/

# Set correct ownership and permissions
sudo chown -R www-data:www-data /var/www/digitalseva
sudo chmod -R 755 /var/www/digitalseva

# Confirm the files are there
ls /var/www/digitalseva
# Expected: index.html  assets/  ...
```

---

## STEP 5 — Update Nginx Config to Serve Frontend + Proxy API

```bash
sudo nano /etc/nginx/sites-available/digitalseva
```

**Replace the entire file with this config:**

```nginx
server {
    listen 80;
    server_name _;

    # Serve React frontend
    root /var/www/digitalseva;
    index index.html;

    # React Router fix — unknown routes return index.html instead of 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api/* to Node.js backend on port 5000
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X` → `Y` → `Enter`

---

## STEP 6 — Enable Site and Reload Nginx

```bash
# If not already enabled, create symlink
sudo ln -sf /etc/nginx/sites-available/digitalseva /etc/nginx/sites-enabled/digitalseva

# Remove the default placeholder if still present
sudo rm -f /etc/nginx/sites-enabled/default

# Test config — must say "syntax is ok"
sudo nginx -t

# Reload Nginx with new config
sudo systemctl reload nginx
```

---

## STEP 7 — Update Backend CORS (on EC2)

Since frontend is now served from EC2 IP (not S3), update `FRONTEND_URL` in backend `.env`:

```bash
nano ~/DigitalSeva/backend/.env
```

Update this line:

```env
FRONTEND_URL=http://3.110.45.200
```

> Same IP as your EC2 — no `/api`, no trailing slash.

Save, then restart the backend:

```bash
pm2 restart digitalseva-api
pm2 logs digitalseva-api --lines 10
# Should show: Server running on port 5000 + MongoDB connected
```

---

## Verification Checklist

```
BACKEND
  [ ] http://3.110.45.200/api/health
      Expected: {"status":"ok","message":"ANTIGRAVITY API running"}

FRONTEND
  [ ] http://3.110.45.200
      Expected: Digital Seva homepage loads

REACT ROUTER (refresh test — very important)
  [ ] Open http://3.110.45.200/admin/login → press F5
      Expected: Page loads (NOT an Nginx 404 error)

  [ ] Open http://3.110.45.200/operator/login → press F5
      Expected: Page loads correctly

FULL END-TO-END
  [ ] Admin login works
  [ ] Operator login works
  [ ] No CORS errors in browser console (F12 → Console)
```

---

## How to Update After Future Code Changes

### Frontend Update

```powershell
# On laptop — after making changes
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm run build

# Upload to EC2
scp -i "C:\Users\DELL\Downloads\digitalseva-key.pem" -r dist ubuntu@3.110.45.200:~/frontend-dist
```

Then on EC2:

```bash
sudo cp -r ~/frontend-dist/* /var/www/digitalseva/
sudo systemctl reload nginx
```

### Backend Update

```bash
# On EC2
cd ~/DigitalSeva
git pull origin main
cd backend && npm install    # only if you added packages
pm2 restart digitalseva-api
pm2 logs digitalseva-api
```

---

## Quick Commands Reference

| Action | Command |
|--------|---------|
| SSH into EC2 | `ssh -i digitalseva-key.pem ubuntu@3.110.45.200` |
| Backend status | `pm2 status` |
| Backend logs | `pm2 logs digitalseva-api` |
| Restart backend | `pm2 restart digitalseva-api` |
| Edit backend .env | `nano ~/DigitalSeva/backend/.env` |
| Test API on server | `curl http://localhost:5000/api/health` |
| Nginx status | `sudo systemctl status nginx` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Nginx error logs | `sudo tail -f /var/log/nginx/error.log` |

---

## Troubleshooting

### Blank page at http://3.110.45.200

```bash
ls /var/www/digitalseva          # Files there?
sudo systemctl status nginx      # Nginx running?
sudo tail -20 /var/log/nginx/error.log
```

### /admin/login refresh shows Nginx 404

The `try_files` directive is missing. Re-check Step 5 and ensure:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
Then: `sudo systemctl reload nginx`

### CORS error in browser console (F12)

```bash
cat ~/DigitalSeva/backend/.env | grep FRONTEND_URL
# Must be exactly: http://3.110.45.200  (no trailing slash)
pm2 restart digitalseva-api
```

### API not responding

```bash
pm2 status
curl http://localhost:5000/api/health
sudo systemctl status nginx
```

---

## Cost (Current Setup)

| Service | Cost |
|---------|------|
| EC2 t3.micro | Free — 750 hrs/month (12-month free tier) |
| MongoDB Atlas M0 | Free forever |
| S3 bucket (unused) | Free — 5 GB free tier, you can delete it |
| **Total** | **$0/month** |

> You can delete the S3 bucket now since it's no longer being used.
> AWS Console → S3 → your bucket → **Delete bucket**

---

## Future: Add CloudFront (HTTPS) When AWS Verifies Your Account

Once AWS verifies your account:

1. CloudFront → **Create distribution**
2. Origin domain: `3.110.45.200` (your EC2 IP)
3. Protocol: HTTP only
4. Viewer protocol policy: **Redirect HTTP to HTTPS**
5. Error pages: 403 → `/index.html` (200), 404 → `/index.html` (200)
6. Create → wait 10–15 min → copy `xxxx.cloudfront.net`
7. Update backend `.env`:
   ```env
   FRONTEND_URL=https://xxxx.cloudfront.net
   ```
8. `pm2 restart digitalseva-api`

No code changes — just config!

---

*Last updated: October 2026 | DigitalSeva v1.0*

---

## Current Status

| Step | Status | Notes |
|------|--------|-------|
| IAM User created | ✅ Done | |
| EC2 launched (Ubuntu) | ✅ Done | You have a public IP e.g. `3.110.45.200` |
| Node.js + PM2 + Nginx installed | ✅ Done | |
| Backend code deployed on EC2 | ✅ Done | PM2 running `digitalseva-api` |
| MongoDB Atlas whitelisted | ✅ Done | EC2 IP added to Network Access |
| S3 bucket created | ✅ Done | Static website hosting enabled |
| `dist/` uploaded to S3 | ✅ Done | `index.html` and `assets/` uploaded |
| Bucket policy set (public read) | ✅ Done | |
| CloudFront | ❌ Blocked | Account verification required |

---

## Architecture (Current — No CloudFront)

```
INTERNET
    │
    ├──────────────────────────────────┐
    │                                  │
    ▼                                  ▼
S3 Static Website (HTTP)          AWS EC2 — Ubuntu
http://YOUR-BUCKET.s3-website     Nginx + Node.js (PM2)
.ap-south-1.amazonaws.com         http://3.110.45.200/api
    │                                  │
    │   React App loads                │ API calls
    │   (HTML + JS + CSS)              │ /api/*
    └──────────────────────────────────┘
                    │
                    ▼
           MongoDB Atlas Cluster
```

---

## What You Need to Do Now (3 Steps)

---

### STEP 1 — Find Your S3 Frontend URL

1. Go to https://console.aws.amazon.com → **S3**
2. Click on your bucket (e.g. `digitalseva-frontend`)
3. Click the **Properties** tab
4. Scroll to **Static website hosting**
5. Copy the **Bucket website endpoint** — it looks like:

```
http://digitalseva-frontend.s3-website.ap-south-1.amazonaws.com
```

> Save this URL — this is your live frontend URL for now.

---

### STEP 2 — Update Backend CORS on EC2

Your backend uses `FRONTEND_URL` to allow CORS. It currently has your old value — update it to your S3 URL.

SSH into EC2:

```powershell
ssh -i "C:\Users\DELL\Downloads\digitalseva-key.pem" ubuntu@3.110.45.200
```

Edit the .env:

```bash
nano ~/DigitalSeva/backend/.env
```

Update `FRONTEND_URL` to your S3 bucket website endpoint:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@...
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://digitalseva-frontend.s3-website.ap-south-1.amazonaws.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongAdminPassword123!
NODE_ENV=production
```

> Replace the `FRONTEND_URL` value with YOUR actual S3 endpoint URL from Step 1.

Save: `Ctrl+X` → `Y` → `Enter`

Restart the backend:

```bash
pm2 restart digitalseva-api

# Confirm it restarted cleanly
pm2 logs digitalseva-api --lines 20
# Should show: Server running on port 5000 + MongoDB connected
```

---

### STEP 3 — Rebuild Frontend and Re-upload to S3

Your frontend's `VITE_API_URL` needs to point to your EC2 backend. Let's verify and rebuild.

#### 3a — Check .env.production on your laptop

Open `C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend\.env.production`

It should contain:

```env
VITE_API_URL=http://3.110.45.200/api
```

> Replace `3.110.45.200` with your actual EC2 public IP.
> Port is NOT needed if Nginx is proxying `/api` on port 80.

#### 3b — Rebuild

```powershell
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm run build
```

#### 3c — Re-upload dist/ to S3

**Option A — AWS CLI (fastest):**

```powershell
aws s3 sync dist/ s3://digitalseva-frontend --delete
```

> Replace `digitalseva-frontend` with your actual bucket name.

**Option B — AWS Console:**

1. Go to S3 → your bucket → **Objects** tab
2. Click **Upload** → Add all files from inside `dist/`
3. Click **Upload**

---

## Verification Checklist

Test all of these in your browser:

```
BACKEND API
  [ ] http://3.110.45.200/api/health
      Expected: {"status":"ok","message":"ANTIGRAVITY API running"}

FRONTEND (S3 URL)
  [ ] http://digitalseva-frontend.s3-website.ap-south-1.amazonaws.com
      Expected: Digital Seva React app loads

REACT ROUTER (refresh test — very important)
  [ ] Go to: http://YOUR-S3-URL/admin/login → press F5
      Expected: Page loads correctly (not an S3 error page)
      Fix if broken: S3 → Properties → Static website hosting
                     Make sure Error document = index.html

  [ ] Go to: http://YOUR-S3-URL/operator/login → press F5
      Expected: Page loads correctly

FULL END-TO-END
  [ ] Admin login works (no CORS errors in browser console)
  [ ] Operator login works
  [ ] Customer request form submits
```

**To check browser console for CORS errors:**
Press `F12` → Console tab → look for red `CORS` errors → if any appear, re-check Step 2.

---

## Quick Commands Cheat Sheet

| Action | Command |
|--------|---------|
| SSH into EC2 | `ssh -i digitalseva-key.pem ubuntu@3.110.45.200` |
| Backend status | `pm2 status` |
| Backend logs | `pm2 logs digitalseva-api` |
| Restart backend | `pm2 restart digitalseva-api` |
| Edit backend .env | `nano ~/DigitalSeva/backend/.env` |
| Test API directly | `curl http://localhost:5000/api/health` |
| Nginx status | `sudo systemctl status nginx` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Re-upload frontend | `aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete` |

---

## How to Update the App After Code Changes

### Update Frontend

```powershell
# 1. Make changes → rebuild
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://digitalseva-frontend --delete
```

> Changes are live immediately (no CDN cache to clear since there is no CloudFront).

### Update Backend

```bash
# On EC2
cd ~/DigitalSeva
git pull origin main
cd backend && npm install    # only if packages changed
pm2 restart digitalseva-api
pm2 logs digitalseva-api
```

---

## Troubleshooting

### React app shows blank white page on S3

```
Check: S3 → bucket → Properties → Static website hosting
  - Index document: index.html  ✅
  - Error document: index.html  ✅  ← most common mistake
```

### Admin/login refresh shows S3 NoSuchKey error

Your S3 **Error document** is not set to `index.html`.

Fix:
1. S3 → your bucket → **Properties** tab
2. **Static website hosting** → **Edit**
3. Set **Error document**: `index.html`
4. Save changes
5. Reload the page

### CORS error in browser console

```bash
# On EC2 — check the value
cat ~/DigitalSeva/backend/.env | grep FRONTEND_URL

# Must match EXACTLY what's in your browser address bar
# Example: http://digitalseva-frontend.s3-website.ap-south-1.amazonaws.com
# (no trailing slash, no https if your S3 is HTTP)

# After fixing .env:
pm2 restart digitalseva-api
```

### API calls return "connection refused"

```bash
pm2 status                        # Is backend running?
sudo systemctl status nginx       # Is Nginx running?
curl http://localhost:5000/api/health   # Test Node.js directly
```

### MongoDB connection error

```bash
pm2 logs digitalseva-api --lines 30
# Go to MongoDB Atlas → Network Access → confirm EC2 IP is listed
```

---

## Cost Summary (Current Setup)

| Service | Cost |
|---------|------|
| EC2 t3.micro | Free (750 hrs/month × 12 months free tier) |
| S3 storage | Free (5 GB free tier) |
| S3 requests | Free (20,000 GET requests free) |
| MongoDB Atlas M0 | Free forever |
| **Total now** | **$0/month** |

---

## Future: Add CloudFront When AWS Verifies Your Account

Once you receive account verification from AWS Support:

1. Go to **CloudFront** → **Create distribution**
2. Origin domain: select your **S3 bucket website endpoint**
3. Viewer protocol policy: **Redirect HTTP to HTTPS**
4. Default root object: `index.html`
5. **Error pages**: add 403 → `index.html` (200) and 404 → `index.html` (200)
6. Create → wait 10 minutes → copy the `xxxx.cloudfront.net` URL
7. Update backend `.env` on EC2:
   ```env
   FRONTEND_URL=https://xxxx.cloudfront.net
   ```
8. `pm2 restart digitalseva-api`
9. Update `VITE_API_URL` in frontend `.env.production` if needed → rebuild → re-upload to S3

No code changes needed — just config updates!

---

*Last updated: October 2026 | DigitalSeva v1.0*
