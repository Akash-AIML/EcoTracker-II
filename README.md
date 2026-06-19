# EcoTrack AI - Full-Spectrum Carbon Intelligence Platform

**Live Deployment (Vercel):** [https://eco-tracker-virid.vercel.app/](https://eco-tracker-virid.vercel.app/)

EcoTrack AI is a modern, responsive, and secure carbon footprint intelligence platform designed for individuals and enterprises to understand, track, and reduce their environmental impact. Built with React Native (Expo) and Node.js, the platform offers dynamic calculation metrics, personalized AI coaching, green gamification leaderboards, and an offset marketplace.

---

## 🌟 Key Features

* **Full-Spectrum Carbon Calculator**: Calculates detailed monthly and yearly emissions across transportation, electricity usage, dietary habits, plastic waste, and shopping frequency.
* **AI Sustainability Coach**: Generates real-time, personalized action plans to reduce your footprint based on category breakdown spikes.
* **Missions & Leaderboard**: Complete green challenges (e.g., *No-Car Week*, *Vegan Weekend*), earn points, unlock levels, and rank on a global user leaderboard.
* **Offset Marketplace**: Sponsor high-impact carbon offset initiatives (Amazon reforestation, wind infrastructure, coastal mangroves, solar panel programs) directly from your profile.
* **Net-Zero Projects Ledger**: Launch and track timeline progress for custom carbon reduction projects (e.g., office lighting upgrades).
* **Cross-Platform Accessibility**: Full screen-reader accessibility integration (`accessible`, roles, labels, hints) across all mobile and web layouts.
* **Bank-Grade Security**: Shielded by `helmet` security headers, strict IP rate limit controls, and input validation/XSS sanitization.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Mobile & Web)
* **Framework**: React Native with Expo (Web + iOS/Android support).
* **Styling**: Vanilla React Native StyleSheet with custom HSL/RGB glassmorphism dark-theme palette.
* **Graphics**: Svg vector paths (`react-native-svg`) for charts and telemetry.

### Backend (API Server)
* **Runtime**: Node.js & Express.
* **Database**: Google Cloud Firebase Firestore with a built-in JSON file mock fallback database (`database.json`) for zero-config offline developer setup.
* **Testing**: Automated integration testing suite via Jest & Supertest.
* **Security**: Helmet, Express-Rate-Limit, Regex validations, and parameter sanitization.

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Setup Cloud Firestore:
   * Generate a private key JSON from the Firebase Console (Project Settings -> Service Accounts).
   * Place the file in `backend/firebase-key.json`.
   * *If no key is added, EcoTrack will automatically fallback to the local mock database file.*
4. Start the API server in developer mode:
   ```bash
   npm run dev
   ```
   The backend server runs locally on **`http://localhost:5000`** (or port `7860` if configured).

### 3. Frontend Setup
1. Navigate back to the root folder:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables:
   * Create a `.env` or configuration mapping setting `EXPO_PUBLIC_API_BASE` pointing to your backend IP (e.g. `http://localhost:5000` for local run).
4. Run the Expo development web environment:
   ```bash
   npx expo start --web
   ```
   The app will compile and launch on **`http://localhost:8081`**.

---

## 🧪 Testing

The backend includes a comprehensive automated suite to test calculations, database inputs, validations, and leaderboard sorting.

Run the tests inside the `backend` directory:
```bash
npm run test
```

Testing utilizes `database.test.json` to prevent polluting development environment databases.

---

## 📦 Deployment Guide

### Backend (Hugging Face Spaces)
The backend is packaged inside a custom Docker container optimized for port 7860:
1. Define space env variables:
   * `FIREBASE_SERVICE_ACCOUNT`: Copy the raw JSON text from your service account key.
2. Build and trigger:
   * Use the provided `backend/Dockerfile` to compile the image. Hugging Face Spaces will automatically run a health check on `/` and mark the container online.

### Frontend (Vercel / Expo Web)
Deploy the built web bundle using Vercel overrides:
* **Framework Preset**: Create React App (or Other)
* **Build Command**: `npx expo export`
* **Output Directory**: `dist`
* **Environment Variable**: `EXPO_PUBLIC_API_BASE` pointing to your deployed Hugging Face Space URL.

---

## 🔒 Security Policy
* **Rate Limits**: Active throttle rules protect endpoints from DoS and script attacks.
* **Helmet Headers**: Blocks iframe clickjacking, MIME injection, and restricts unsafe browser scripts.
* **Input Validation**: Strictly inspects email domains and filters strings to protect data streams.
