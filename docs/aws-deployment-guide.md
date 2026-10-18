# AWS Deployment Guide — Digital Seva (DigitalSeva)

> **Stack**: React (Vite) Frontend + Node.js/Express Backend + MongoDB Atlas (connection string)
> **AWS Services Used**: S3, CloudFront, EC2, IAM
> **Skill Level**: Beginner-friendly — every step is explained

---

## Architecture Overview

```
                          INTERNET
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                │
  ┌─────────────────┐   ┌─────────────────┐    │
  │  AWS CloudFront │   │   AWS EC2        │    │
  │  (CDN + HTTPS)  │   │  (Ubuntu Server) │    │
  │                 │   │                  │    │
  │ Serves React    │   │ Node.js + PM2    │    │
  │ app from S3     │   │ + Nginx          │    │
  └────────┬────────┘   └────────┬─────────┘    │
           │                    │               │
           ▼                    ▼               │
  ┌─────────────────┐   ┌─────────────────┐    │
  │   AWS S3 Bucket │   │  MongoDB Atlas   │    │
  │  (Static Files) │   │ (your conn str)  │    │
  └─────────────────┘   └─────────────────┘    │
```

### What goes where

| Component | AWS Service | Why |
|-----------|-------------|-----|
| React Frontend (dist/ files) | S3 + CloudFront | Free/cheap, globally fast CDN |
| Node.js Backend (API server) | EC2 (Ubuntu t3.micro) | Full server, runs 24/7 |
| MongoDB | MongoDB Atlas | You already have a connection string |

---

## PART 1 — AWS Account Setup (One-Time)

### Step 1.1 — Create an IAM User (do NOT use root account)

1. Go to https://console.aws.amazon.com and log in with your root account
2. In the search bar, type **IAM** and click it
3. Click **Users** → **Create user**
4. Username: `digitalseva-admin`
5. Check **"Provide user access to the AWS Management Console"** → click Next
6. Select **"Attach policies directly"**
7. Search and add these 3 policies:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AmazonEC2FullAccess`
8. Click **Create user**
9. Go to the user → **Security credentials** tab → **Create access key** → CLI → Download CSV
10. Log in using this IAM user from now on

---

## PART 2 — Backend Deployment on EC2

> Your backend is a Node.js/Express server (server.js) that needs to run 24/7.
> EC2 gives you a virtual Linux server for this.

### Step 2.1 — Launch an EC2 Instance

1. Go to AWS Console → search **EC2** → click **Launch Instance**
2. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | Name | `digitalseva-backend` |
   | AMI (OS) | **Ubuntu Server 24.04 LTS** (free tier eligible) |
   | Instance type | **t3.micro** (free tier — 1 vCPU, 1 GB RAM) |
   | Key pair | Click "Create new key pair" → name: `digitalseva-key` → RSA → .pem → **Download it** |
   | Storage | 8 GB gp3 (default) |

3. Under **Network Settings** → click **Edit**:
   - Auto-assign public IP: **Enable**
   - Security group name: `digitalseva-sg`

4. Add these **Inbound Rules**:

   | Type | Port | Source | Purpose |
   |------|------|--------|---------|
   | SSH | 22 | My IP | Connect from your laptop |
   | HTTP | 80 | 0.0.0.0/0 | Web traffic |
   | HTTPS | 443 | 0.0.0.0/0 | Secure web traffic |
   | Custom TCP | 5000 | 0.0.0.0/0 | Your Node.js API port |

5. Click **Launch Instance**
6. Wait 2 minutes until state shows **"Running"**
7. Copy the **Public IPv4 address** (e.g., `3.110.45.200`) — you'll need this often

---

### Step 2.2 — SSH into Your EC2 Server

Open **PowerShell** on your Windows laptop:

```powershell
ssh -i "C:\Users\DELL\Downloads\digitalseva-key.pem" ubuntu@3.110.45.200
```

> Replace `3.110.45.200` with your actual EC2 IP

> If you get a permissions error on the .pem file:
> Right-click digitalseva-key.pem → Properties → Security → Advanced
> → Disable inheritance → Remove all → Add yourself with Read-only

You should now see the Ubuntu prompt: `ubuntu@ip-172-31-xx-xx:~$`

---

### Step 2.3 — Install Node.js, PM2, Git on EC2

Run these commands inside your EC2 terminal:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version    # Should show: v20.x.x
npm --version     # Should show: 10.x.x

# Install PM2 (keeps server running in background + auto-restart on crash)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

---

### Step 2.4 — Upload Your Backend Code

#### Option A — Clone from GitHub (recommended)

```bash
# On your EC2 terminal
cd ~
git clone https://github.com/lingampellisri/DigitalSeva.git
cd DigitalSeva/backend
```

#### Option B — Copy from your laptop (if GitHub is private/not set up)

Open a **new PowerShell window on your laptop**:

```powershell
scp -i "C:\Users\DELL\Downloads\digitalseva-key.pem" -r "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\backend" ubuntu@3.110.45.200:~/backend
```

Then SSH back in and: `cd ~/backend`

---

### Step 2.5 — Create the .env File on EC2

```bash
# Inside the backend folder on EC2
nano .env
```

Paste this into the file (edit the values):

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@yourcluster.mongodb.net/digital_seva_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_here
FRONTEND_URL=https://XXXXXX.cloudfront.net
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongAdminPassword123!
NODE_ENV=production
```

Save: Press `Ctrl+X` → `Y` → `Enter`

> MONGO_URI: Paste your actual MongoDB Atlas connection string
> FRONTEND_URL: You will get this from CloudFront in Part 3 — come back and update it later

> To generate a strong JWT_SECRET, run this on your laptop:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

### Step 2.6 — Install Dependencies and Start with PM2

```bash
# Install packages
npm install

# Test manually first
node server.js
# Should print: Server running on http://localhost:5000
# Press Ctrl+C to stop

# Start with PM2 (runs in background)
pm2 start server.js --name "digitalseva-api"

# Auto-start on server reboot
pm2 startup
# IMPORTANT: Copy and run the command PM2 prints (starts with "sudo env ...")
pm2 save

# Check status
pm2 status
```

**Test your API:**
Open browser → `http://3.110.45.200:5000/api/health`
Expected: `{"status":"ok","message":"ANTIGRAVITY API running"}`

---

### Step 2.7 — Set Up Nginx (Port 80 → Port 5000)

This lets your API work on the standard port 80 instead of 5000.

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/digitalseva
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    location / {
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

Save, then:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/digitalseva /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config (should say "syntax is ok")
sudo nginx -t

# Start and enable Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

**Test port 80:**
`http://3.110.45.200/api/health` (no :5000 needed anymore!)

---

## PART 3 — Frontend Deployment on S3 + CloudFront

> After `npm run build`, React produces static files in dist/.
> S3 hosts these files, CloudFront delivers them fast via CDN with HTTPS.

### Step 3.1 — Update Frontend API URL

On your **Windows laptop**, open:
`C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend\.env.production`

Set it to:

```env
VITE_API_URL=http://3.110.45.200/api
```

> Replace `3.110.45.200` with your actual EC2 public IP

---

### Step 3.2 — Build the React App

```powershell
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm install
npm run build
```

This creates a `dist/` folder. Upload this to S3.

---

### Step 3.3 — Create an S3 Bucket

1. AWS Console → search **S3** → **Create bucket**
2. Settings:

   | Setting | Value |
   |---------|-------|
   | Bucket name | `digitalseva-frontend-yourname` (must be globally unique) |
   | Region | `ap-south-1` (Mumbai) |
   | Block Public Access | Uncheck "Block all public access" → acknowledge warning |
   | All other settings | Leave default |

3. Click **Create bucket**

---

### Step 3.4 — Enable Static Website Hosting

1. Click your bucket → **Properties** tab
2. Scroll to **Static website hosting** → **Edit**
3. Settings:
   - Enable: **Yes**
   - Index document: `index.html`
   - Error document: `index.html` ← (critical for React Router!)
4. **Save changes**
5. Copy the **Bucket website endpoint** shown at the bottom

---

### Step 3.5 — Upload dist/ Files to S3

#### Via AWS Console:
1. Click bucket → **Objects** tab → **Upload**
2. Click **Add files** — select all files inside `dist/` (not the dist folder itself)
3. Click **Add folder** — select the `assets/` folder inside `dist/`
4. Click **Upload**

#### Via AWS CLI (faster):
First install AWS CLI: https://aws.amazon.com/cli/

Configure:
```powershell
aws configure
# AWS Access Key ID: (from IAM CSV file)
# Secret Access Key: (from IAM CSV file)
# Region: ap-south-1
# Output: json
```

Upload:
```powershell
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
aws s3 sync dist/ s3://digitalseva-frontend-yourname --delete
```

---

### Step 3.6 — Set S3 Bucket Policy (Public Read)

1. Bucket → **Permissions** tab → **Bucket policy** → **Edit**
2. Paste (replace bucket name with yours):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::digitalseva-frontend-yourname/*"
        }
    ]
}
```

3. **Save changes**

Test: Open the S3 website endpoint URL — you should see the React app!

---

### Step 3.7 — Create CloudFront Distribution

1. AWS Console → search **CloudFront** → **Create distribution**
2. Settings:

   | Setting | Value |
   |---------|-------|
   | Origin domain | Select your S3 bucket website endpoint from dropdown |
   | Protocol | HTTP only |
   | Viewer protocol policy | **Redirect HTTP to HTTPS** |
   | Allowed HTTP methods | GET, HEAD |
   | Cache policy | CachingOptimized |
   | Price class | Use North America, Europe and Asia |
   | Default root object | `index.html` |

3. Click **Create distribution**
4. Wait 5–15 minutes for status to change from "Deploying" to "Enabled"
5. Copy the **Distribution domain name** (e.g., `d1abc123xyz.cloudfront.net`)

---

### Step 3.8 — Fix React Router 404s in CloudFront

When users refresh /admin/login or any React route, CloudFront would show an S3 error without this fix.

1. CloudFront → your distribution → **Error pages** tab
2. Click **Create custom error response** — add these two:

   **First:**
   | HTTP error code | 403 |
   | Customize error response | Yes |
   | Response page path | `/index.html` |
   | HTTP response code | 200 |

   **Second:** Same as above but HTTP error code = **404**

3. **Save changes**

---

### Step 3.9 — Update Backend CORS with CloudFront URL

1. SSH back into EC2
2. Edit the .env:

```bash
nano ~/DigitalSeva/backend/.env
```

Update:
```env
FRONTEND_URL=https://d1abc123xyz.cloudfront.net
```

3. Restart the backend:
```bash
pm2 restart digitalseva-api
pm2 logs digitalseva-api
```

---

## PART 4 — MongoDB Atlas Configuration

### Step 4.1 — Allow EC2 IP in Atlas

1. Go to https://cloud.mongodb.com
2. Your project → **Network Access** → **Add IP Address**
3. Enter your EC2 IP: `3.110.45.200`
   OR click **"Allow access from anywhere"** (`0.0.0.0/0`) for quick setup
4. Click **Confirm**

That's it! Your backend's MONGO_URI connection string handles everything else.

---

## PART 5 — Final Verification Checklist

```
BACKEND
  [ ] http://YOUR_EC2_IP/api/health  →  {"status":"ok"}
  [ ] pm2 status  →  digitalseva-api is "online"
  [ ] pm2 logs digitalseva-api  →  shows "MongoDB connected"

FRONTEND
  [ ] https://XXXX.cloudfront.net  →  React app loads
  [ ] Refresh /admin/login  →  still works (no S3 error)
  [ ] Login form calls API  →  no CORS error in browser console

FULL FLOW
  [ ] Admin login works end-to-end
  [ ] Operator login works end-to-end
  [ ] Customer request form submits
```

---

## PART 6 — Updating Your App After Code Changes

### Update Frontend

```powershell
# On your laptop — after making changes
cd "C:\Users\DELL\Desktop\Learn\Online-service-reactApp\frontend"
npm run build
aws s3 sync dist/ s3://digitalseva-frontend-yourname --delete

# Clear CloudFront cache (so users get the new version immediately)
aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXXXX --paths "/*"
```

> Find your distribution ID: CloudFront console → your distribution → copy the ID (starts with E)

### Update Backend

```bash
# On EC2 terminal
cd ~/DigitalSeva
git pull origin main              # Pull latest code from GitHub
cd backend
npm install                       # Only if you added new npm packages
pm2 restart digitalseva-api       # Restart with new code
pm2 logs digitalseva-api          # Check for errors
```

---

## PART 7 — Cost Estimate

| Service | AWS Free Tier | After Free Tier |
|---------|---------------|-----------------|
| EC2 t3.micro | 750 hrs/month free (12 months) | ~$8–10/month |
| S3 | 5 GB + 20K requests free | Cents per GB |
| CloudFront | 1 TB transfer free (12 months) | ~$0.085/GB |
| MongoDB Atlas M0 | Free forever | Free (M0 tier) |
| **Total (free tier period)** | **$0/month** | **~$10–15/month** |

---

## PART 8 — Troubleshooting

### API returns "Connection refused"
```bash
pm2 status                        # Is it running?
sudo netstat -tlnp | grep 5000    # Is port 5000 open?
# Check EC2 Security Group — port 5000 must allow 0.0.0.0/0
```

### Browser shows CORS error
```bash
cat ~/DigitalSeva/backend/.env | grep FRONTEND_URL
# Make sure it matches exactly what's in your browser URL bar (https://xxxx.cloudfront.net)
pm2 restart digitalseva-api
```

### React app blank page or 403 error
- Check S3 bucket policy (Part 3, Step 3.6)
- Check CloudFront custom error pages (Part 3, Step 3.8)
- Verify default root object in CloudFront is set to `index.html`

### MongoDB connection failed
```bash
pm2 logs digitalseva-api          # Check the error message
# Go to MongoDB Atlas → Network Access → add your EC2 IP
# Double-check MONGO_URI is correct in .env
```

### Frontend changes not showing after upload
```powershell
aws cloudfront create-invalidation --distribution-id EXXXXXXX --paths "/*"
```

---

## Quick Reference Card

| Action | Command / URL |
|--------|---------------|
| SSH into EC2 | `ssh -i digitalseva-key.pem ubuntu@YOUR_EC2_IP` |
| Backend health check | `http://YOUR_EC2_IP/api/health` |
| View backend logs | `pm2 logs digitalseva-api` |
| Restart backend | `pm2 restart digitalseva-api` |
| Frontend live URL | `https://XXXX.cloudfront.net` |
| Deploy frontend update | `aws s3 sync dist/ s3://YOUR_BUCKET --delete` |
| Clear CDN cache | `aws cloudfront create-invalidation --distribution-id EXXXXX --paths "/*"` |
