# SkillBridge — Multi-Vendor Service Marketplace Platform

[![Status](https://img.shields.io/badge/status-development-yellow?style=flat-square)](https://github.com/Abdul-Wahab-Subhani/skillbridge-marketplace)
[![GitHub stars](https://img.shields.io/github/stars/Abdul-Wahab-Subhani/skillbridge-marketplace?style=flat-square)](https://github.com/Abdul-Wahab-Subhani/skillbridge-marketplace/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Abdul-Wahab-Subhani/skillbridge-marketplace?style=flat-square)](https://github.com/Abdul-Wahab-Subhani/skillbridge-marketplace/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Abdul-Wahab-Subhani/skillbridge-marketplace?style=flat-square)](https://github.com/Abdul-Wahab-Subhani/skillbridge-marketplace/issues)
[![Last Commit](https://img.shields.io/github/last-commit/Abdul-Wahab-Subhani/skillbridge-marketplace?style=flat-square)](https://github.com/Abdul-Wahab-Subhani/skillbridge-marketplace/commits/main)
[![License](https://img.shields.io/github/license/Abdul-Wahab-Subhani/skillbridge-marketplace?style=flat-square)](https://github.com/Abdul-Wahab-Subhani/skillbridge-marketplace/blob/main/LICENSE)

[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-atlas-4ea94b?style=flat-square)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/cloudinary-uploads-blue?style=flat-square)](https://cloudinary.com)


> **Teyzix Core Internship | Task ID: FSWD-1 | Domain: Full Stack Web Development**

A production-ready, full-stack marketplace platform where customers browse and request services from providers, with real-time project tracking, role-based dashboards, and a review system.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Schema](#2-database-schema)
3. [API Documentation](#3-api-documentation)
4. [Folder Structure](#4-folder-structure)
5. [Environment Setup](#5-environment-setup)
6. [Running Locally](#6-running-locally)
7. [Deployment Guide](#7-deployment-guide)
8. [Bonus Features](#8-bonus-features)
9. [Evaluation Checklist](#9-evaluation-checklist)
10. [Improvement Suggestions](#10-improvement-suggestions)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│          React 18 + React Router + Tailwind CSS                 │
│    AuthContext · ThemeContext (dark mode) · SocketContext        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
                    ┌────────▼────────┐
                    │   Express API   │  ← JWT auth middleware
                    │   + Socket.io   │  ← Real-time events
                    └────────┬────────┘
             ┌───────────────┼───────────────┐
             │               │               │
     ┌───────▼──┐   ┌────────▼──┐   ┌───────▼──────┐
     │ MongoDB  │   │Cloudinary │   │ Nodemailer   │
     │  Atlas   │   │  (Files)  │   │  (Email)     │
     └──────────┘   └───────────┘   └──────────────┘
```

### Design Patterns
- **Separation of concerns** — models / controllers / routes / middleware each in their own layer
- **Role-Based Access Control (RBAC)** — every route specifies which roles can access it
- **Fire-and-forget activity logging** — never blocks the main request flow
- **Real-time push over polling** — Socket.io rooms keyed by userId for targeted events
- **Modular upload factory** — `makeUploader(folder)` returns a configured multer instance

---

## 2. Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, lowercase |
| password | String | bcrypt hashed, `select: false` |
| role | Enum | customer / provider / admin |
| avatar | `{url, publicId}` | Cloudinary reference |
| phone | String | optional |
| isActive | Boolean | default true (admin can suspend) |
| lastLogin | Date | updated on every login |

### ProviderProfile (1-to-1 with User)
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | unique |
| title | String | e.g. "Full Stack Developer" |
| bio | String | max 1000 chars |
| skills | [String] | indexed for filtering |
| experienceYears | Number | |
| hourlyRate | Number | USD |
| portfolio | [{title, description, image, link}] | embedded sub-docs |
| avgRating | Number | recalculated on each new Review |
| numReviews | Number | |
| totalEarnings | Number | incremented on Completed status |
| completedProjects | Number | |
| availability | Enum | available / busy / unavailable |

### Service
| Field | Type | Notes |
|-------|------|-------|
| provider | ObjectId → User | |
| title | String | max 100 chars, text-indexed |
| description | String | max 2000 chars, text-indexed |
| category | Enum | 9 categories |
| price | Number | USD |
| deliveryTime | Number | days |
| images | [{url, publicId}] | up to 5 |
| tags | [String] | lowercase, text-indexed |
| isActive | Boolean | provider can deactivate |
| ordersCount | Number | incremented on new request |

### ServiceRequest
| Field | Type | Notes |
|-------|------|-------|
| service | ObjectId → Service | |
| customer | ObjectId → User | |
| provider | ObjectId → User | |
| requirements | String | max 3000 chars |
| budget | Number | USD |
| deadline | Date | must be future |
| status | Enum | Pending / Accepted / In Progress / Completed / Delivered / Rejected / Cancelled |
| statusHistory | [{status, changedBy, note, changedAt}] | immutable append-only log |
| isReviewed | Boolean | prevents duplicate reviews |

### Review
| Field | Type | Notes |
|-------|------|-------|
| request | ObjectId → ServiceRequest | unique (1 review per request) |
| service | ObjectId → Service | |
| customer / provider | ObjectId → User | |
| rating | Number | 1–5, triggers provider avgRating recalc |
| comment | String | max 1000 chars |

### ActivityLog
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | optional (system events) |
| action | String | e.g. USER_REGISTERED, REQUEST_STATUS_UPDATED |
| description | String | human-readable |
| meta | Mixed | arbitrary JSON (IDs etc.) |

---

## 3. API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

### Auth Routes `/api/auth`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Create account (customer/provider) |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Get own profile |
| PUT | `/me` | Private | Update name/phone |
| PUT | `/change-password` | Private | Change password |
| POST | `/logout` | Private | Logout (activity log) |

### Provider Routes `/api/providers`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | List providers (search, skill filter) |
| GET | `/:id` | Public | Provider public profile + services |
| GET | `/profile/me` | Provider | Get own profile |
| PUT | `/profile` | Provider | Update profile fields |
| POST | `/avatar` | Private | Upload avatar image |
| POST | `/portfolio` | Provider | Add portfolio item |
| DELETE | `/portfolio/:itemId` | Provider | Remove portfolio item |

### Service Routes `/api/services`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | Browse (search, category, price filter, pagination) |
| GET | `/:id` | Public | Single service detail |
| GET | `/provider/mine` | Provider | Provider's own listings |
| POST | `/` | Provider | Create listing |
| PUT | `/:id` | Provider (owner) | Update listing |
| DELETE | `/:id` | Provider/Admin | Delete listing |

### Request Routes `/api/requests`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | Customer | Submit new service request |
| GET | `/customer/mine` | Customer | Customer's own requests |
| GET | `/provider/mine` | Provider | Requests received |
| GET | `/` | Admin | All requests (paginated) |
| GET | `/:id` | Participant/Admin | Single request detail |
| PUT | `/:id/status` | Role-based | Update project status |

**Status transition rules:**
```
Pending  → Accepted / Rejected  (provider/admin)
Pending  → Cancelled            (customer/admin)
Accepted → In Progress          (provider/admin)
Accepted → Cancelled            (customer/admin)
In Progress → Completed         (provider/admin)
Completed → Delivered           (customer/admin)
```

### Review Routes `/api/reviews`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | Customer | Submit review (only after Delivered) |
| GET | `/provider/:id` | Public | Get reviews for a provider |

### Dashboard Routes `/api/dashboard`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/customer` | Customer | Active requests, stats |
| GET | `/provider` | Provider | Earnings, projects, monthly chart |
| GET | `/admin` | Admin | Platform-wide analytics |

### Admin Routes `/api/admin`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users` | Admin | All users (filterable by role) |
| PUT | `/users/:id/status` | Admin | Activate/suspend user |
| GET | `/activity` | Admin | Recent activity logs |
| GET | `/top-providers` | Public | Top-rated providers (for landing page) |

### Health Check
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/health` | Public | Server status |

---

## 4. Folder Structure

```
marketplace/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + multer factory
│   ├── models/
│   │   ├── User.js
│   │   ├── ProviderProfile.js
│   │   ├── Service.js
│   │   ├── ServiceRequest.js
│   │   ├── Review.js
│   │   └── ActivityLog.js
│   ├── middleware/
│   │   ├── auth.js            # protect() + authorize()
│   │   ├── errorHandler.js    # notFound + global error handler
│   │   └── validate.js        # express-validator runner
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── providerController.js
│   │   ├── serviceController.js
│   │   ├── requestController.js
│   │   ├── reviewController.js
│   │   ├── dashboardController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── providerRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── logActivity.js
│   │   ├── socket.js          # Socket.io init + emitToUser
│   │   └── seed.js            # Demo data seeder
│   ├── server.js              # Express app + Socket.io entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js       # Configured Axios instance
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── ThemeContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ServiceCard.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── ProjectTracker.jsx
    │   │   ├── StarRating.jsx
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Services.jsx
    │   │   ├── ServiceDetail.jsx
    │   │   ├── CreateEditService.jsx
    │   │   ├── Providers.jsx
    │   │   ├── ProviderProfilePublic.jsx
    │   │   ├── Profile.jsx
    │   │   ├── RequestDetail.jsx
    │   │   ├── NotFound.jsx
    │   │   └── dashboards/
    │   │       ├── CustomerDashboard.jsx
    │   │       ├── ProviderDashboard.jsx
    │   │       └── AdminDashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .env.example
```

---

## 5. Environment Setup

### Backend — `backend/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/marketplace

JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional — for email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=SkillBridge <no-reply@skillbridge.io>

# Optional — prevents accidental admin registration in production
ADMIN_REGISTRATION_SECRET=change_this_before_production
```

### Frontend — `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 6. Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier is fine)
- Cloudinary account (free tier is fine)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on port 5000

# Optional: seed demo data
npm run seed
# Creates: admin@demo.com / provider@demo.com / customer@demo.com
# Password for all: password123
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # adjust if needed
npm run dev            # starts on http://localhost:5173
```

---

## 7. Deployment Guide

### Backend → Railway / Render

1. **Railway (recommended)**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   railway login
   railway init          # inside /backend
   railway up
   # Add environment variables in the Railway dashboard
   ```

2. **Render**
   - Connect your GitHub repo
   - Set Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add all environment variables from `.env.example`

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel          # follow prompts
# Set environment variables:
# VITE_API_URL = https://your-api.railway.app/api
# VITE_SOCKET_URL = https://your-api.railway.app
```

Or via Vercel dashboard — import the `/frontend` folder, set framework to Vite.

### MongoDB Atlas
- Create a free M0 cluster at cloud.mongodb.com
- Whitelist `0.0.0.0/0` under Network Access (for cloud deployments)
- Copy the connection string to `MONGO_URI`

### Cloudinary
- Register at cloudinary.com (free 25GB storage)
- Copy `Cloud Name`, `API Key`, `API Secret` to `.env`

---

## 8. Bonus Features

| Feature | Status | Notes |
|---------|--------|-------|
| Dark Mode | ✅ Implemented | ThemeContext + Tailwind `darkMode: 'class'` |
| Real-time notifications | ✅ Implemented | Socket.io — status updates, new requests |
| Activity Logs | ✅ Implemented | ActivityLog model + Admin dashboard tab |
| Email notifications | 🔧 Ready to wire | Nodemailer config in `.env.example` — add calls to `sendMail()` in controllers |
| Stripe payments | 🔧 Pattern shown | Add `npm i stripe` + `/api/payments/create-intent` endpoint; call from `ServiceDetail.jsx` before request submission |

---

## 9. Evaluation Checklist

| Criteria | Implementation |
|----------|----------------|
| ✅ User Registration | `POST /api/auth/register` — customer/provider/admin roles |
| ✅ Login/Logout | JWT + bcrypt, activity logged |
| ✅ Password Hashing | bcryptjs with salt rounds = 10, `select: false` |
| ✅ JWT Auth | `protect` middleware checks every private route |
| ✅ RBAC | `authorize(...roles)` middleware on all role-restricted routes |
| ✅ Provider Profile | Bio, skills, experience, hourly rate, portfolio, avatar |
| ✅ Service Listings | CRUD with category, price, delivery time, images, tags |
| ✅ Service Browse | Text search, category filter, price range, pagination |
| ✅ Service Requests | Requirements, budget, deadline — customer only |
| ✅ Project Tracking | 5-step workflow with status history, role-based transitions |
| ✅ Reviews | 1-5 star + comment, only after Delivered, avg recalculated |
| ✅ Customer Dashboard | Active requests, completed projects, stats |
| ✅ Provider Dashboard | Earnings, active projects, pending requests, service CRUD |
| ✅ Admin Dashboard | User stats, service analytics, request analytics, activity logs |
| ✅ Responsive UI | Mobile/tablet/desktop via Tailwind responsive classes |
| ✅ Dark Mode (bonus) | Full dark theme via Tailwind class strategy |
| ✅ Real-time (bonus) | Socket.io rooms per user, status update + new request events |
| ✅ Activity Logs (bonus) | All major actions logged with user, action type, meta |

---

## 10. Improvement Suggestions

1. **Stripe Payment Integration** — Add an escrow-style payment flow: customer pays when submitting a request, funds release to provider on Delivered status.
2. **Real-time Chat** — Add a `Message` model and Socket.io `chat:message` event within a request's room (`request_{id}`).
3. **Email Notifications** — Nodemailer is already configured; wire `sendMail()` to key events: new request, status change, review received.
4. **Dispute System** — Add a `Disputed` status and admin mediation flow.
5. **Service Packages** — Allow providers to define Basic/Standard/Premium tiers per listing.
6. **Provider Verification** — Admin-approval step before a provider can publish services.
7. **Search Enhancements** — Elasticsearch or MongoDB Atlas Search for more powerful full-text capabilities.
8. **Rate Limiting** — `express-rate-limit` on auth endpoints to prevent brute-force.
9. **Unit & Integration Tests** — Jest + Supertest for the API; React Testing Library for UI.
10. **CI/CD Pipeline** — GitHub Actions workflow: lint → test → deploy on push to `main`.
