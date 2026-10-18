# AWS Deployment Guide — Digital Seva
### Updated Plan: Single EC2 Server (No CloudFront)

> **Why no CloudFront?**
> New AWS accounts need account verification before creating CloudFront resources.
> This guide uses a simpler, equally production-ready approach — everything on one EC2 server.
>
> **Stack**: React (Vite) + Node.js/Express + MongoDB Atlas
> **AWS Services Used**: EC2, IAM
> **Skill Level**: Beginner-friendly

---

## Architecture

```
INTERNET
    │
    ▼  port 80
┌─────────────────────────────────────────┐
│           AWS EC2 — Ubuntu Server        │
│                                          │
│   Nginx (reverse proxy + static server)  │
│   ├── /        → serves React dist/      │
│   └── /api/*   → proxy to Node.js :5000  │
│                                          │
│   Node.js + Express (PM2, port 5000)     │
└───────────────────┬──────────────────────┘
                    │ MongoDB connection string
                    ▼
           MongoDB Atlas Cluster
```

### What goes where

| Component | Runs on | Method |
|-----------|---------|--------|
| React Frontend (static files) | EC2 via Nginx | Copied from `dist/` to `/var/www/digitalseva` |
| Node.js Backend (API) | EC2 via PM2 | `pm2 start server.js` on port 5000 |
| MongoDB | MongoDB Atlas | Connection string in `.env` |

---

## PART 1 — AWS Account Setup (One-Time)

### Step 1.1 — Create an IAM User

> Never use your root AWS account for daily work.

1. Log in to https://console.aws.amazon.com
2. Search **IAM** → **Users** → **Create user**
3. Username: `digitalseva-admin`
4. Check **"Provide user access to the AWS Management Console"** → Next
5. Select **"Attach policies directly"**
6. Add: `AmazonEC2FullAccess`
7. Click **Create user**
8. Go to the new user → **Security credentials** tab → **Create access key** → **CLI** → Download CSV

> Keep the CSV file safe — it has your access keys.

---

## PART 2 — Backend Deployment on EC2

### Step 2.1 — Launch an EC2 Instance

1. AWS Console → search **EC2** → **Launch Instance**
2. Fill in:

   | Setting | Value |
   |---------|-------|
   | Name | `digitalseva-server` |
   | AMI | **Ubuntu Server 24.04 LTS** (free tier eligible) |
   | Instance type | **t3.micro** (free tier — 1 vCPU, 1 GB RAM) |
   | Key pair | **Create new key pair** → Name: `digitalseva-key` → RSA → `.pem` → **Download** |
   | Storage | 8 GB gp3 (default) |

3. Under **Network Settings** → click **Edit**:
   - Auto-assign public IP: **Enable**
   - Security group name: `digitalseva-sg`

4. Add **Inbound Rules**:

   | Type | Port | Source | Purpose |
   |------|------|--------|---------|
   | SSH | 22 | My IP | Connect from your laptop |
   | HTTP | 80 | 0.0.0.0/0 | Web traffic (frontend + API) |
   | Custom TCP | 5000 | 0.0.0.0/0 | Node.js (for direct testing only) |

5. Click **Launch Instance**
6. Wait ~2 minutes → state becomes **Running**
7. Copy the **Public IPv4 address** — e.g. `3.110.45.200`

   > This IP is your app's public address. Write it down.

---

### Step 2.2 — Connect to EC2 via SSH

Open **PowerShell** on your Windows laptop:

```powershell
ssh -i "C:\Users\DELL\Downloads\digitalseva-key.pem" ubuntu@3.110.45.200
```

> Replace `3.110.45.200` with YOUR actual EC2 IP.

**If you get a permissions error on the .pem file:**
```powershell
icacls "C:\Users\DELL\Downloads\digitalseva-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

You should now see: `ubuntu@ip-172-31-xx-xx:~$`

---

### Step 2.3 — Install Node.js, PM2, Git, Nginx on EC2

Run these commands one by one in the EC2 terminal:

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node installation
node --version      # v20.x.x
npm --version       # 10.x.x

# Install PM2 (keeps Node.js running 24/7, restarts on crash)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install Nginx (web server / reverse proxy)
sudo apt install -y nginx
```

---

### Step 2.4 — Upload Backend Code to EC2

#### Option A — Clone from GitHub (recommended)

```bash
# On EC2 terminal
cd ~
git clone https://github.com/lingampellisri/DigitalSeva.git
cd DigitalSeva/backend
```

#### Option B — Copy from your laptop (if repo is private)

Open a **new PowerShell window on your laptop**:

```powershell
scp -i "C:\Users\DELL\Downloads\digitalseva-key.pem" -r "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\backend" ubuntu@3.110.45.200:~/backend
```

Then on EC2: `cd ~/backend`

---

### Step 2.5 — Create .env File on EC2

```bash
# Inside your backend folder on EC2
nano .env
```

Paste and edit these values:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@yourcluster.mongodb.net/digital_seva_db?retryWrites=true&w=majority
JWT_SECRET=paste_a_long_random_string_here_minimum_32_characters
FRONTEND_URL=http://3.110.45.200
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongAdminPassword123!
NODE_ENV=production
```

Save: `Ctrl+X` → `Y` → `Enter`

> **MONGO_URI**: Paste your full MongoDB Atlas connection string here.
>
> **FRONTEND_URL**: Your EC2 public IP (replace with your actual IP).
>
> **JWT_SECRET**: Generate a strong one on your laptop:
> ```powershell
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### Step 2.6 — Install Dependencies and Start with PM2

```bash
# Install Node.js packages
npm install

# Quick test (then Ctrl+C to stop)
node server.js
# Expected: Server running on http://localhost:5000

# Start with PM2 (background process)
pm2 start server.js --name "digitalseva-api"

# Configure PM2 to auto-start on server reboot
pm2 startup
# IMPORTANT: Copy and run the sudo command that PM2 prints

pm2 save

# Verify it's running
pm2 status
# Should show: digitalseva-api → online
```

**Quick test (run on EC2):**
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","message":"ANTIGRAVITY API running"}
```

---

## PART 3 — Frontend Deployment on EC2 via Nginx

### Step 3.1 — Update Frontend .env.production on Your Laptop

Open `C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend\.env.production`

Make sure it contains:

```env
VITE_API_URL=http://3.110.45.200/api
```

> Replace `3.110.45.200` with your actual EC2 IP.

---

### Step 3.2 — Build the React App

Open **PowerShell on your laptop**:

```powershell
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm install
npm run build
```

Verify the build:
```powershell
ls dist
# Should show: index.html  assets/  ...
```

---

### Step 3.3 — Upload dist/ to EC2

```powershell
# Upload the built files to EC2
scp -i "C:\Users\DELL\Downloads\digitalseva-key.pem" -r "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend\dist" ubuntu@3.110.45.200:~/frontend-dist
```

Wait for it to finish (may take 30–60 seconds depending on file size).

---

### Step 3.4 — Move Files to Nginx Web Root

Back in the **EC2 terminal**:

```bash
# Create web directory
sudo mkdir -p /var/www/digitalseva

# Copy built files
sudo cp -r ~/frontend-dist/* /var/www/digitalseva/

# Set correct ownership for Nginx
sudo chown -R www-data:www-data /var/www/digitalseva
sudo chmod -R 755 /var/www/digitalseva

# Confirm files exist
ls /var/www/digitalseva
# Expected: index.html  assets/  vite.svg  ...
```

---

### Step 3.5 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/digitalseva
```

**Paste this entire config:**

```nginx
server {
    listen 80;
    server_name _;

    # Serve React frontend static files
    root /var/www/digitalseva;
    index index.html;

    # React Router fix — all unknown routes return index.html (not Nginx 404)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy all /api/* requests to Node.js backend on port 5000
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

### Step 3.6 — Enable the Nginx Config and Restart

```bash
# Enable your site
sudo ln -s /etc/nginx/sites-available/digitalseva /etc/nginx/sites-enabled/

# Remove the default placeholder site
sudo rm /etc/nginx/sites-enabled/default

# Test for syntax errors
sudo nginx -t
# Expected: "syntax is ok" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx

# Enable Nginx to start automatically on reboot
sudo systemctl enable nginx

# Confirm it is running
sudo systemctl status nginx
# Expected: active (running)
```

---

## PART 4 — MongoDB Atlas Network Access

### Step 4.1 — Whitelist Your EC2 IP

1. Go to https://cloud.mongodb.com
2. Your project → **Network Access** (left sidebar) → **Add IP Address**
3. Enter your EC2 IP: `3.110.45.200`
   — OR click **Allow Access from Anywhere** (`0.0.0.0/0`) for quick setup
4. Click **Confirm**

> Your MONGO_URI in `.env` handles everything else — no other changes needed.

---

## PART 5 — Final Verification Checklist

Open your browser and test each URL:

```
BACKEND
  [ ] http://3.110.45.200/api/health
      Expected: {"status":"ok","message":"ANTIGRAVITY API running"}

FRONTEND
  [ ] http://3.110.45.200
      Expected: Digital Seva React app loads correctly

REACT ROUTER (most important — refresh test)
  [ ] Go to http://3.110.45.200/admin/login and hit F5
      Expected: Page loads normally (NOT an Nginx 404 error)

  [ ] Go to http://3.110.45.200/operator/login and hit F5
      Expected: Page loads normally

FULL END-TO-END
  [ ] Admin login works
  [ ] Operator login works

EC2 SERVER HEALTH
  [ ] pm2 status              → digitalseva-api is "online"
  [ ] pm2 logs digitalseva-api → shows "MongoDB connected"
```

---

## PART 6 — How to Update Your App After Code Changes

### Update the Frontend

```powershell
# On your laptop — after making React changes

# 1. Rebuild
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm run build

# 2. Upload new dist/ to EC2
scp -i "C:\Users\DELL\Downloads\digitalseva-key.pem" -r dist ubuntu@3.110.45.200:~/frontend-dist
```

Then SSH into EC2 and run:
```bash
sudo cp -r ~/frontend-dist/* /var/www/digitalseva/
sudo systemctl reload nginx
```

### Update the Backend

```bash
# SSH into EC2
ssh -i "C:\Users\DELL\Downloads\digitalseva-key.pem" ubuntu@3.110.45.200

# Pull latest code
cd ~/DigitalSeva
git pull origin main

# Reinstall packages if needed
cd backend && npm install

# Restart backend
pm2 restart digitalseva-api

# Check logs
pm2 logs digitalseva-api --lines 20
```

---

## PART 7 — Quick Commands Reference

| Action | Command |
|--------|---------|
| SSH into EC2 | `ssh -i digitalseva-key.pem ubuntu@3.110.45.200` |
| Backend status | `pm2 status` |
| Backend logs | `pm2 logs digitalseva-api` |
| Restart backend | `pm2 restart digitalseva-api` |
| Nginx status | `sudo systemctl status nginx` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Nginx error logs | `sudo tail -f /var/log/nginx/error.log` |
| Test API on server | `curl http://localhost:5000/api/health` |
| Edit backend .env | `nano ~/DigitalSeva/backend/.env` |

---

## PART 8 — Cost Estimate

| Service | AWS Free Tier | After 12 Months |
|---------|---------------|-----------------|
| EC2 t3.micro | 750 hrs/month free (12 months) | ~$8–10/month |
| MongoDB Atlas M0 | Free forever | Free |
| Data transfer | 100 GB/month free | ~$0.09/GB |
| **Total** | **$0/month** | **~$10/month** |

---

## PART 9 — Troubleshooting

### React app shows blank page
```bash
sudo systemctl status nginx          # Is Nginx running?
ls /var/www/digitalseva              # Are files in the right place?
sudo tail -20 /var/log/nginx/error.log  # Any errors?
```

### /admin/login refresh shows Nginx 404
The `try_files` directive is missing. Re-check Step 3.5 and make sure the Nginx config has:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
Then run: `sudo systemctl reload nginx`

### API calls fail (network error or CORS error)
```bash
pm2 status                                         # Is backend running?
curl http://localhost:5000/api/health              # Test locally on server
curl http://3.110.45.200/api/health                # Test via Nginx
cat ~/DigitalSeva/backend/.env | grep FRONTEND_URL # Check CORS URL
pm2 restart digitalseva-api
```

### MongoDB connection failed
```bash
pm2 logs digitalseva-api --lines 30    # Read the actual error
# Fix: Go to MongoDB Atlas → Network Access → Add EC2 IP
# Fix: Double check MONGO_URI in .env has correct username/password
```

### SSH "permission denied" on .pem file
```powershell
icacls "C:\Users\DELL\Downloads\digitalseva-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

---

## Future Upgrade: Adding CloudFront (When AWS Verifies Your Account)

Once AWS verifies your account (contact AWS Support), adding CloudFront is simple:

1. Create a CloudFront distribution pointing to `http://3.110.45.200`
2. Set viewer protocol → **Redirect HTTP to HTTPS**
3. Add custom error responses (403 → `/index.html`, 404 → `/index.html`)
4. Update `FRONTEND_URL` in backend `.env` to the CloudFront HTTPS URL
5. `pm2 restart digitalseva-api`

No code changes needed to your React app or Node.js server!

---

*Last updated: October 2026 | DigitalSeva v1.0*
