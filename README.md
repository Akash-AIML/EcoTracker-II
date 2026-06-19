---
title: EcoTracker II
emoji: 📉
colorFrom: yellow
colorTo: purple
sdk: docker
pinned: false
short_description: Backend for the event Prompt Wars
---

# EcoTrack AI — Advanced Carbon Footprint Awareness Platform

EcoTrack AI is a state-of-the-art web application designed to help users measure, understand, and reduce their carbon footprint. Powered by **Groq Cloud AI**, the platform offers a personalized AI sustainability coach, 30-day carbon reduction action plans, interactive "what-if" simulations, and a gamified leaderboard with streaks, points, and badges to drive user engagement.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Database: Firestore](https://img.shields.io/badge/Database-Firebase_Firestore-orange.svg)](https://firebase.google.com/)
[![AI: Groq Cloud](https://img.shields.io/badge/AI-Groq_Llama3-blueviolet)](https://groq.com/)
[![Tests: Passing](https://img.shields.io/badge/Tests-167_Passing-brightgreen)](#testing-and-verification)

**Live Demo:** [eco-tracker-ii-123.vercel.app](https://eco-tracker-ii-123.vercel.app/)

---

## Table of Contents

1. [Architecture & Database Transition](#architecture--database-transition)
2. [Groq AI Integration & Usage](#groq-ai-integration--usage)
3. [Scientific Calculation & Emission Factors](#scientific-calculation--emission-factors)
4. [Scoring & Benchmark Interpolation](#scoring--benchmark-interpolation)
5. [Gamification & Achievements System](#gamification--achievements-system)
6. [Tech Stack](#tech-stack)
7. [Security Hardening Techniques](#security-hardening-techniques)
8. [Folder Structure](#folder-structure)
9. [Page Use Cases & Features](#page-use-cases--features)
10. [Installation & Setup](#installation--setup)
11. [Testing and Verification](#testing-and-verification)

---

## Architecture & Database Transition

Originally built on top of a relational schema using Prisma and PostgreSQL, EcoTrack AI was transitioned to **Firebase Firestore** to align with modern serverless and document-based practices.

```
┌─────────────────────────────────┐                 ┌───────────────────────────────┐
│       React 18 Frontend         │ ──────────────► │       Express 4 Backend       │
│   (Vite, Tailwind, Recharts)    │    HTTPS/REST   │   (Helmet, Rate-Limiting, Zod)│
└─────────────────────────────────┘                 └──────────────┬────────────────┘
                                                                   │
                                                     firebase-admin│  groq-sdk
                                                                   ▼  ▼
                                                    ┌───────────────────────────────┐
                                                    │  Firebase Firestore Database  │
                                                    │  (Users, Assessments, Streaks)│
                                                    └───────────────────────────────┘
```

### Why Firebase Firestore?

- **Document-Centric Model**: Carbon assessments and simulation states are inherently tree-like, hierarchical data. A document-based NoSQL database allows storing user metrics and footprints as direct, rich documents rather than performing heavy relational joins.
- **Schema Flexibility**: Enables future expansion of assessment categories (e.g., adding home heating types or detailed food options) without writing complex SQL schema migrations.
- **Serverless Scale**: Low-latency reads and writes that scale automatically, providing instantaneous calculations and ranking checks.
- **Data Schema Details**:
  - `users`: Stores user credentials, streaks, ranks, points, and earned badges.
  - `assessments`: Flat collection storing historical carbon footprints indexed by `userId`.
  - `simulations`: Captures user configuration states for what-if scenarios.

### Hermetic Test Mocking

To ensure integration and unit tests run instantly and are completely insulated from external database network states, the backend uses a custom in-memory Firestore engine in [`firebaseClient.js`](./backend/src/utils/firebaseClient.js).

- When running in `test` environment, the Firebase Admin connection is bypassed.
- A robust, virtual mock store runs in memory to manage users and assessments, executing 160+ tests in under 5 seconds with zero server dependencies.

### Version 1 to Version 2 Database Migration

To preserve history, the backend includes a migration utility in [`migrateDb.js`](./backend/src/utils/migrateDb.js). This script reads historical footprint documents from the V1 subcollection structure (`users/{userId}/history`) and migrates them into flat V2 collections. It parses legacy breakdown objects (extracting transport, electricity, food, waste, and shopping emissions) and populates modern metadata variables automatically.

---

## Groq AI Integration & Usage

EcoTrack AI integrates the **Groq SDK** to provide lightning-fast, context-aware artificial intelligence. Powered by high-throughput Llama-3 inference models, the AI operates across five main areas:

1. **AI Sustainability Coach (`POST /api/ai/chat`)**
   - An interactive chat assistant where users can ask for eco-friendly recommendations.
   - Provides immediate, real-world advice based on the user's specific carbon footprint breakdown.
2. **30-Day Net-Zero Action Plan (`POST /api/ai/plan`)**
   - Generates a step-by-step 30-day timeline designed to lower the user's carbon footprint.
   - Customizes actions depending on whether the user's highest emissions originate from Transport, Energy, Food, or Shopping.
3. **Narrative Score Analysis (`POST /api/ai/score`)**
   - Looks at a user's numerical sustainability score and writes a narrative assessment explaining what their rating signifies.
4. **Daily Eco Micro-Tip (`GET /api/ai/tip`)**
   - Generates a daily tip centered on sustainable living.
   - Caches tips on the server for 24 hours to minimize API hits.
5. **Narrative Comparison Analysis (`POST /api/ai/compare`)**
   - Explains how the user's footprint compares to global averages and the Paris Agreement target (2,000 kg CO₂e/yr).

---

## Scientific Calculation & Emission Factors

EcoTrack AI calculates carbon footprints utilizing annualized kilograms of carbon dioxide equivalent ($kg\text{ CO}_2\text{e/year}$) based on coefficients compiled from peer-reviewed databases (including IPCC AR6, US EPA, and UK BEIS/DEFRA 2023).

### Reference Emission Factors

| Source Category | Asset/Habit Type  | Carbon Coefficient | Unit                                                               |
| :-------------- | :---------------- | :----------------- | :----------------------------------------------------------------- |
| **Transport**   | Petrol Car        | `0.21`             | $kg\text{ CO}_2\text{ / km}$                                       |
|                 | Diesel Car        | `0.17`             | $kg\text{ CO}_2\text{ / km}$                                       |
|                 | Hybrid Car        | `0.105`            | $kg\text{ CO}_2\text{ / km}$                                       |
|                 | Electric Car      | `0.047`            | $kg\text{ CO}_2\text{ / km}$                                       |
|                 | Public Transport  | `0.089`            | $kg\text{ CO}_2\text{ / km}$ (Bus average)                         |
|                 | Train             | `0.041`            | $kg\text{ CO}_2\text{ / km}$                                       |
|                 | Short-Haul Flight | `255.0`            | $kg\text{ CO}_2\text{ / return flight } (<3\text{ hrs})$           |
|                 | Long-Haul Flight  | `1620.0`           | $kg\text{ CO}_2\text{ / return flight } (>3\text{ hrs})$           |
| **Energy**      | Grid Electricity  | `0.233`            | $kg\text{ CO}_2\text{ / kWh}$ (UK Grid 2023)                       |
| **Food & Diet** | Heavy Meat Diet   | `3300.0`           | $kg\text{ CO}_2\text{ / year}$                                     |
|                 | Mixed Diet        | `2500.0`           | $kg\text{ CO}_2\text{ / year}$                                     |
|                 | Vegetarian Diet   | `1700.0`           | $kg\text{ CO}_2\text{ / year}$                                     |
|                 | Vegan Diet        | `1500.0`           | $kg\text{ CO}_2\text{ / year}$                                     |
| **Shopping**    | Clothing Item     | `33.0`             | $kg\text{ CO}_2\text{ / item}$ (Manufacturing + Transport)         |
|                 | Electronic Device | `300.0`            | $kg\text{ CO}_2\text{ / device}$ (Lifecycle manufacturing average) |

### Formula Systems

- **Transport Emissions**:
  $$\text{Emissions}_{\text{transport}} = (\text{Daily Car Km} \times \text{Factor}_{\text{car}} \times 365) + (\text{Public Transport Km/Week} \times 52 \times 0.089) + (\text{Short Flights} \times 255) + (\text{Long Flights} \times 1620)$$
- **Home Energy Emissions** (incorporating renewable energy tariff credits):
  $$\text{Emissions}_{\text{energy}} = \text{Monthly Electricity (kWh)} \times 12 \times 0.233 \times \left(1 - \frac{\text{Renewable \%}}{100}\right)$$
- **Shopping Emissions**:
  $$\text{Emissions}_{\text{shopping}} = (\text{Clothing/Year} \times 33) + (\text{Electronics/Year} \times 300)$$

---

## Scoring & Benchmark Interpolation

Sustainability scores range from **0 to 100** based on the total annualized carbon footprint. Instead of flat rating brackets, EcoTrack AI applies **piecewise linear interpolation** across five primary benchmark reference points:

- **Paris Agreement 2050 Target**: $2,000\text{ kg CO}_2\text{e/year}$ (Score: **100**)
- **Excellent Threshold**: $3,000\text{ kg CO}_2\text{e/year}$ (Score: **90**)
- **Good Threshold**: $5,000\text{ kg CO}_2\text{e/year}$ (Score: **70**)
- **Moderate Threshold**: $7,500\text{ kg CO}_2\text{e/year}$ (Score: **50**)
- **High/Poor Threshold**: $12,000\text{ kg CO}_2\text{e/year}$ (Score: **0**)

### Score Interpolation Logic

- **If emissions $\le 2000$**: Score is **100**.
- **If $2000 < \text{emissions} \le 3000$**:
  $$\text{Score} = 90 + \left(\frac{3000 - \text{emissions}}{3000 - 2000}\right) \times 10$$
- **If $3000 < \text{emissions} \le 5000$**:
  $$\text{Score} = 70 + \left(\frac{5000 - \text{emissions}}{5000 - 3000}\right) \times 20$$
- **If $5000 < \text{emissions} \le 7500$**:
  $$\text{Score} = 50 + \left(\frac{7500 - \text{emissions}}{7500 - 5000}\right) \times 20$$
- **If $7500 < \text{emissions} < 12000$**:
  $$\text{Score} = \left(\frac{12000 - \text{emissions}}{12000 - 7500}\right) \times 50$$
- **If emissions $\ge 12000$**: Score is **0**.

---

## Gamification & Achievements System

EcoTrack AI builds tracking habits by rewarding sustainable choices through a points, streaks, badges, and rank titles system.

### Points Allocation

- **Assessment Submission**: Base reward of **$100\text{ points}$** per unique assessment log.
- **Streak Milestone Bonuses**:
  - **3-Day Streak**: Adds a **$+50\text{ points}$** bonus.
  - **7-Day Streak**: Adds a **$+250\text{ points}$** bonus.

### Ranks & Levels

Based on total points accumulated, users level up through ranks:

| Points Required   | Rank Title                          |
| :---------------- | :---------------------------------- |
| `0 - 999`         | **Eco Novice** (Baseline tier)      |
| `1,000 - 2,999`   | **Green Sprout**                    |
| `3,000 - 5,999`   | **Carbon Reducer**                  |
| `6,000 - 9,999`   | **Nature Enthusiast**               |
| `10,000 - 14,999` | **Ocean Guardian**                  |
| `15,000 - 24,999` | **Climate Champion**                |
| `25,000+`         | **Master Guardian** (Ultimate tier) |

### Achievements & Badges

Badges are analyzed during calculation routines and unlocked when meeting the following criteria:

| Badge Image/Title | Criteria for Unlocking                                                                        |
| :---------------- | :-------------------------------------------------------------------------------------------- |
| **Tree Planter**  | User reports a `vegan` or `vegetarian` dietType.                                              |
| **Carbon Ninja**  | User drives `0 km` daily OR drives a `hybrid`/`electric` vehicle OR has `none` for fuel type. |
| **Zero Waste**    | User buys less than `5` clothes per year AND `0` electronics items per year.                  |

---

## Tech Stack

| Layer        | Technologies Used                                                  |
| ------------ | ------------------------------------------------------------------ |
| **Core**     | HTML5, Vanilla CSS, Javascript (ES Modules)                        |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Recharts, Axios, React Router v6 |
| **Backend**  | Node.js 18+, Express 4, Helmet, Zod, Groq SDK, Firebase Admin SDK  |
| **Database** | Firebase Firestore (Real-time Document Store)                      |
| **Testing**  | Vitest, JSDOM, React Testing Library, Supertest                    |

---

## Security Hardening Techniques

EcoTrack AI implements a multi-layer defense-in-depth security model:

- **Strict Content Security Policy (CSP)**: Managed through Helmet.js middleware, restriction rules block execution of inline script payloads. Approved connect boundaries (`connectSrc`) are configured for local development and production Vercel apps.
- **Rate Limiting**: Custom rate limits are established via `express-rate-limit`:
  - **Default API Limit**: `100 requests / 15 minutes` across the app.
  - **User Registration (`/api/users`)**: Restricted to `15 registrations / hour` to prevent identity spoofing and sybil attacks.
  - **Assessment Submissions (`/api/assessments`)**: Capped at `30 submissions / hour` to mitigate database flooding.
- **Input Sanitization**: Built via custom XSS sanitizers (`sanitize.js`) in the backend route controllers. Any user text input (such as sustainability plan goals or coach chat messages) is parsed to strip out HTML tags and characters matching script patterns.
- **Zod Schema Parsing**: Validates matching data types, structures, and bounds for all API requests. Unrecognized schema keys in requests are rejected immediately.
- **Safe Key Isolation**: Firebase Service Account keys are read from `firebase-key.json` and are ignored in git commits by `.gitignore`.

---

## Folder Structure

```
carbon/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Express route controllers (User, Assessment, AI, etc.)
│   │   ├── middleware/    # Rate limiters, error handling schemas
│   │   ├── routes/        # API route definitions (ai.js, users.js, assessments.js, etc.)
│   │   ├── services/      # Business logic (scoring, carbon math, Groq AI coach)
│   │   ├── tests/         # Unit and integration test suites
│   │   └── utils/         # firebaseClient, logger, sanitize helpers, migrateDb script
│   ├── .env.example
│   ├── firebase-key.json  # Git-ignored Firebase credential file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI widgets, charts, and layout components
│   │   ├── hooks/         # Custom React hooks (useUser, useAssessment)
│   │   ├── pages/         # Page components (Calculator, Dashboard, Coach, Leaderboard)
│   │   ├── services/      # API axios instances
│   │   ├── tests/         # Frontend component and integration tests
│   │   └── utils/         # Debouncing, formatting, and cache handlers
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json           # Monorepo management
└── README.md
```

---

## Page Use Cases & Features

### 1. Carbon Footprint Calculator

- **Use Case**: Allows users to input daily habits across 4 distinct categories (Transport, Energy, Food, Shopping).
- **Details**: Dynamic progress indicators, validation feedback, and instant emission calculations (annualized kg CO₂e).

### 2. Interactive Dashboard

- **Use Case**: Visual representation of the carbon footprint.
- **Details**: Powered by Recharts. Renders category emission pie charts, progress over time, and comparative benchmark sliders (comparing user footprint to global and Paris Agreement targets).

### 3. What-If Simulation Widget

- **Use Case**: Lets users simulate changes in their habits (e.g. eating less meat, walking more, reducing electricity usage).
- **Details**: Provides instant, dynamic reductions feedback showing how lifestyle changes impact their overall carbon footprint in real-time.

### 4. AI Coach Chat & Planner

- **Use Case**: Direct interactive messaging with the sustainability coach.
- **Details**: Users get custom 30-day timelines, daily tips, and structured advice for lowering their footprints.

### 5. Gamification & Leaderboards

- **Use Case**: Encourages continuous tracking and eco-friendly competition.
- **Details**: Shows user streaks, points earned for low footprints, ranks (e.g., "Eco Warrior"), and achievement badges (e.g., "Renewable Pioneer").

---

## Installation & Setup

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9
- A **Firebase Firestore** project database (Free tier)

### 1. Configure the Backend

1. Navigate to `/backend` and create a `.env` file from the example:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Populate the `.env` file:
   - Add your `GROQ_API_KEY` (obtained from [console.groq.com](https://console.groq.com)).
3. Save your Firebase Service Account JSON credentials file as `firebase-key.json` in the `/backend` folder. _(Alternatively, stringify the JSON key and paste it as the `FIREBASE_SERVICE_ACCOUNT` value in your `.env`)_.

### 2. Configure the Frontend

1. Navigate to `/frontend` and create a `.env` file:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
2. By default, it points to local development:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

### 3. Start the Development Servers

In the root directory, install all dependencies:

```bash
# Root directory
npm install
```

Start the backend API server:

```bash
# In backend/
npm run dev
```

Start the React development server:

```bash
# In frontend/
npm run dev
```

Open **http://localhost:5173** to run the application locally.

---

## Deployment (Free Tier Hosting)

The platform is designed to be hosted for free using a split server/client architecture:

### 1. Backend: Hugging Face Spaces (Docker)

The Node.js/Express backend runs in a free Hugging Face Space using Docker.

- **Hardware:** CPU Basic (Free Tier - 2 vCPU · 16 GB).
- **Environment Variables & Secrets:**
  - `PORT`: `7860` (assigned automatically by Hugging Face)
  - `GROQ_API_KEY`: Your Groq Cloud API key.
  - `CORS_ORIGIN`: Your deployed Vercel frontend URL (e.g., `https://eco-tracker-ii-123.vercel.app`).
  - `FIREBASE_SERVICE_ACCOUNT`: The stringified JSON content of your `firebase-key.json` file.
- **Dockerfile:** Create this at the root directory:
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  COPY backend/package*.json ./backend/
  RUN npm install && npm install --prefix backend
  COPY backend/ ./backend/
  ENV NODE_ENV=production
  ENV PORT=7860
  EXPOSE 7860
  WORKDIR /app/backend
  CMD ["npm", "start"]
  ```

### 2. Frontend: Vercel (Static Web Hosting)

The React/Vite client is hosted on Vercel (Live at: `https://eco-tracker-ii-123.vercel.app`).

- **Root Directory:** `frontend`
- **Environment Variables:**
  - `VITE_API_URL`: Your Hugging Face Space endpoint (e.g., `https://akash-dragon-ecotracker-ii.hf.space/api`).

---

## Testing and Verification

To run tests across both the backend and frontend, run the following command in the root folder:

```bash
# From the project root folder
npm test
```

### Coverage

- **Backend**: Includes tests for emissions calculation formulas, rate limits, Zod schema validation, and Express routes.
- **Frontend**: Includes tests for React hooks, cached calculations, custom debouncing utility, HTML sanitization, and the multi-step calculator workflow.

# EcoTracker-II
