# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shorty is a URL shortener SaaS with a Node.js/Express backend and two Angular frontend apps. Users can create shortened links with optional password protection, expiration dates, and custom suffixes. The app includes analytics tracking, Google OAuth login, and subscription-based pricing via Lemon Squeezy.

## Repository Structure

This is a monorepo with three independent projects (each has its own `package.json` and `node_modules`):

- **`backend/`** — Express + TypeScript API server with MongoDB/Mongoose
- **`minify-url/`** — Angular 19 + Ionic frontend (older version, uses proxy config for local dev)
- **`shortLink/`** — Angular 19 + Tailwind CSS + Angular Material frontend (current active version, deployed to Netlify)

## Build & Dev Commands

### Backend (`backend/`)
```bash
cd backend
npm run dev          # Start dev server with nodemon+tsx (watches src/, auto-restarts)
npm run build        # Build with tsup to dist/
npm start            # Run production build (node dist/index.js)
```

### shortLink frontend (`shortLink/`)
```bash
cd shortLink
ng serve             # Dev server at http://localhost:4200
ng build --configuration production   # Production build to dist/short-link
ng test              # Run Karma/Jasmine unit tests
```

### minify-url frontend (`minify-url/`)
```bash
cd minify-url
ng serve --proxy-config proxy.conf.json   # Dev server with API proxy to localhost:3000
ng build             # Production build to dist/minify-url
ng test              # Run Karma/Jasmine unit tests
```

## Architecture

### Backend
- **Entry point:** `src/index.ts` — sets up Express, Socket.IO, CORS, sessions (stored in MongoDB via connect-mongo), Passport
- **Routes are registered as functions** that receive the Express app: `urlRoutes(app)`, `authRoutes(app)`, `pricingRoutes(app, io)`
- **API prefix:** All routes are under `/api/` (e.g., `/api/url/create`, `/api/auth/sign-in`)
- **Mongoose models:** User, Url, Analytics, Subscription, Products — with ObjectId references between them (User has shortLinks[] and subscription)
- **URL shortening:** Uses `nanoid(10)` for generating short link IDs
- **Auth:** JWT tokens for session auth, bcrypt for password hashing, Google OAuth login via `/api/auth/google-login`
- **Real-time:** Socket.IO rooms (keyed by userId) for pushing subscription webhook events from Lemon Squeezy to the frontend
- **Subscription management:** Lemon Squeezy webhooks hit `/api/webhook`, which processes events and emits Socket.IO events

### Frontend (shortLink — active)
- **Standalone components** with lazy-loaded routes
- **Auth guard** protects all routes except `/auth/*`
- **Home layout** contains sidebar navigation with child routes: all-links, analytics, profile, pricing
- **Dynamic routes** `/:id` and `/:suffix/:id` resolve short links to the ViewLinkComponent
- **Services:** AuthService, UrlService, AnalyticsService, PricingService, SocketService, GoogleAuthService
- **Styling:** Tailwind CSS v4 + SCSS
- **Charts:** ECharts (ngx-echarts) and ApexCharts (ng-apexcharts) for analytics
- **Production API:** `https://shorty-kt3r.onrender.com` (configured in `environments/environment.prod.ts`)
- **Deployment:** Netlify with SPA redirect (`netlify.toml`)

### Frontend (minify-url — legacy)
- Uses Ionic components instead of Material/Tailwind
- Has a `proxy.conf.json` that forwards `/api` to `localhost:3000` during development
- Uses TanStack Table for link display

## Key Patterns

- **ServerResponse utility** (`backend/src/utils/server-response.ts`) wraps all API responses in a consistent format
- **Product limitations** are checked in `backend/src/utils/productLimitations/` (max links per subscription tier)
- **Security options** for links: None or Password-protected (enum shared between frontend and backend)
- **Analytics** are auto-created when a short link is created and updated on each visit
- Backend runs on port 3000 by default; frontends on port 4200
