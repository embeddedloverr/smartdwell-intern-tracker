# Smartdwell Intern Tracker

A full-stack Next.js 14 web application for tracking intern training progress at Smartdwell Technologies. Built with the App Router, TypeScript, Tailwind CSS, MongoDB/Mongoose, and NextAuth.js.

## Features

- **Two roles**: Mentor (rahul@smartdwell.in) and Intern accounts
- **80 tasks** across a 16-week, 4-phase IoT training curriculum
- **Intern Dashboard**: Task tracking, daily logs, progress charts, confidence scores
- **Mentor Dashboard**: Intern overview, task review with feedback, daily log review, progress charts
- **JWT authentication** with NextAuth.js Credentials provider
- **IST timezone** display for all dates

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- NextAuth.js v4
- Recharts (charts)
- date-fns + date-fns-tz (IST dates)
- lucide-react (icons)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/smartdwell_tracker
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
MENTOR_EMAIL=rahul@smartdwell.in
MENTOR_PASSWORD=smartdwell@2025
```

### 3. Start MongoDB

Ensure MongoDB is running locally or use MongoDB Atlas.

### 4. Run development server

```bash
npm run dev
```

### 5. Seed tasks

Log in as mentor (rahul@smartdwell.in / smartdwell@2025), then either:

- Click "Seed Tasks" on the mentor dashboard, or
- Run: `npm run seed`

### 6. Create intern accounts

From the mentor dashboard, go to "Manage Interns" and create intern accounts.

## Deployment on AWS EC2 (PM2 + Nginx)

### 1. Build the application

```bash
npm run build
```

### 2. Start with PM2

```bash
pm2 start npm --name "intern-tracker" -- start
pm2 save
pm2 startup
```

### 3. Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. MongoDB

Use MongoDB Atlas free tier or install MongoDB locally on the EC2 instance.

### 5. First deploy checklist

1. Set all `.env.local` variables on the server
2. `npm run build`
3. Start with PM2
4. Log in as mentor and click "Seed Tasks" (run once)
5. Create intern accounts from the mentor dashboard

## Project Structure

```
app/
  (auth)/login/         - Login page
  intern/               - Intern dashboard (overview, tasks, daily-log, progress)
  mentor/               - Mentor dashboard (overview, intern detail, manage interns)
  api/                  - All API route handlers

components/
  ui/                   - ProgressRing, StatusBadge, TaskCard, WeekAccordion, etc.
  charts/               - ConfidenceChart, CompletionChart (Recharts)
  forms/                - DailyLogForm, InternForm
  layout/               - Sidebar (intern), Navbar (mentor)

lib/                    - MongoDB connection, NextAuth config, utilities
models/                 - Mongoose schemas (User, Task, TaskRecord, DailyLog)
scripts/                - Seed script for 80 curriculum tasks
```
