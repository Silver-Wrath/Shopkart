# Shopkart

Full-stack e-commerce app (MERN): products, auth (register/login with JWT), cart, wishlist, and checkout with orders (Razorpay-ready, with a built-in demo payment mode).

## Tech Stack

- **Frontend:** React + Vite (React Router, Context for auth/cart)
- **Backend:** Node.js + Express 5 (ES modules), Mongoose
- **Database:** MongoDB (Atlas or local); falls back to an in-memory MongoDB automatically with seeded sample products
- **Auth:** JWT stored in an httpOnly cookie
- **Payments:** Razorpay API — or a local simulated flow when no Razorpay keys are configured

## Project Structure

```
backend/server/       Express API (controllers, models, routes, config)
frontend/             React app (pages, components, context)
```

> Note: `backend/controllers`, `backend/models`, etc. are symlinks to `backend/server/*`.

## Setup

### Prerequisites

- Node.js 18+ and npm
- A MongoDB URI (Atlas connection string or a local MongoDB). No Mongo? The server falls back to an in-memory database and seeds sample products, so the app runs either way.
- Razorpay Test Mode keys (optional — leave out to use demo payments)

### 1. Install dependencies

```bash
# Root (backend deps)
npm install

# Backend server
cd backend/server && npm install

# Frontend
cd ../../frontend && npm install
```

### 2. Environment variables (never commit these!)

Create `backend/server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<dbname>
JWT_SECRET=any-long-random-string
# Optional — Razorpay Test Mode keys. Omit to run in demo payment mode.
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-test-key-secret
```

`JWT_SECRET` is required for login/register. Razorpay keys are optional: without them the app uses the same create/verify payment flow simulated locally, so the full checkout still works end-to-end.

### 3. Run

```bash
# Backend — from backend/server (runs on http://localhost:3000)
npm start

# Frontend — from frontend (runs on http://localhost:5173)
npm run dev
```

The API exposes `/customers` (auth), `/products`, `/wishlist`, `/cart`, and `/orders`.

## Checklist

- [x] Complete frontend + backend implementation
- [x] Working database integration (Atlas / local / in-memory fallback)
- [x] Setup instructions (this README)
- [x] No API keys, secrets, or .env files in the repository
