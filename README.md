<div align="center">

# 🩺 CareSentry AI

<a href="https://cs.prathamh.com/">
	<img src="https://img.shields.io/badge/CareSentry%20AI-Digital%20Health%20Companion-6366f1?style=for-the-badge" alt="CareSentry AI" />
</a>

### **Medication reminders • Prescription digitization • Symptom guidance**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Flask-API-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)

<br />

[🚀 Quick Start](#-quick-start) • [✨ Features](#-feature-highlights) • [🎯 Users](#-target-users) • [🔐 Security](#-security--privacy) • [🛠️ Tech Stack](#️-tech-stack) • [📖 Local Setup](#-project-setup-guide) • [📡 API](#-api-reference) • [🗺️ Roadmap](#️-project-roadmap)

<br />

</div>

## 🎯 What is CareSentry AI?

CareSentry AI is an intelligent health management platform designed to assist users with **medication reminders**, **quick symptom guidance**, and **AI-powered analysis** for minor health issues. Built with a focus on accessibility and reliability, it serves as a digital health companion for individuals and caregivers alike.

**Deployed Link:** https://cs.prathamh.com/

---

## ✨ Feature Highlights

<table>
<tr>
<td align="center" width="25%">
<h3>⏰</h3>
<b>Medication Scheduling</b><br/>
<sub>Set routines and avoid missed doses</sub>
</td>
<td align="center" width="25%">
<h3>📨</h3>
<b>Telegram Reminders</b><br/>
<sub>Automated notifications via Telegram bot</sub>
</td>
<td align="center" width="25%">
<h3>🧾</h3>
<b>Prescription Digitization</b><br/>
<sub>OCR scanning for medicines and details</sub>
</td>
<td align="center" width="25%">
<h3>🤖</h3>
<b>Symptom Guidance</b><br/>
<sub>AI-powered quick symptom checking</sub>
</td>
</tr>
</table>

---

## 🎯 Target Users

<table>
<tr>
<td width="50%">

### 👵 Elderly Individuals
- Simplified interface for ease of use
- Large fonts & clear instructions

</td>
<td width="50%">

### 💊 People with Chronic Conditions
- Consistent reminders and health monitoring
- Better adherence tracking through schedules

</td>
</tr>
<tr>
<td width="50%">

### 🧑‍⚕️ Caregivers
- Better patient management tools
- Visibility into schedules and prescriptions

</td>
<td width="50%">

### 🩹 General Health-Conscious Users
- Quick, reliable first-aid and symptom guidance
- Easy prescription scanning and storage

</td>
</tr>
</table>

**Key User Needs:**
- Simple, user-friendly design
- Large fonts & clear instructions
- Quick, reliable responses

---

## 🔐 Security & Privacy

CareSentry AI prioritizes data protection with:
- End-to-end encryption for sensitive health data
- API calls secured with HTTPS & AES-256 encryption at rest
- JWT-based authentication with role-based access control

---

## 🛠️ Tech Stack

<table>
<tr>
<th>Layer</th>
<th>Technology</th>
</tr>
<tr>
<td>Frontend</td>
<td>React.js + Vite + Tailwind CSS</td>
</tr>
<tr>
<td>Backend</td>
<td>Node.js + Express.js</td>
</tr>
<tr>
<td>Database</td>
<td>MongoDB</td>
</tr>
<tr>
<td>AI/ML Components</td>
<td>Symptom-checking chatbot & image analysis (OCR)</td>
</tr>
<tr>
<td>Communication</td>
<td>Telegram notifications (plus WhatsApp & SMS integration in services)</td>
</tr>
</table>

---

## 🚀 Quick Start

Run all services locally (Backend + Frontend + ML + optional Disease Model):

```bash
# 1) Backend
cd backend
npm install

# 2) Frontend
cd ..\frontend
npm install

# 3) ML OCR server
cd ..\ml
pip install -r requirements.txt

# 4) (Optional) Disease model server
cd ..\disease_model
pip install -r requirements.txt
```

Then start each service in its own terminal:

```bash
# Backend (http://localhost:3000)
cd backend
npm run dev

# Frontend (http://localhost:5173)
cd ..\frontend
npm run dev

# OCR / ML (http://localhost:5000)
cd ..\ml
python test_server_pythonic.py

# Disease model (http://localhost:5001)
cd ..\disease_model
python app.py
```

---

## 📖 Project Setup Guide

This guide explains how to **install dependencies**, **configure environment variables**, and **run all servers** (Backend, Frontend, and ML) locally.

### Python/ML Setup (OCR Service)

This setup is for the Python-based Machine Learning server under `./ml/`.

#### 1) Environment Variables

Create a file named `.env` inside the `./ml/` directory:

```env
# Required
# Use a GitHub token that has GitHub Models access (needs models:read)
GITHUB_TOKEN=your_github_token_here

# Alternative name supported as well
# GITHUB_API_KEY=your_github_token_here

# Optional
CORS_ORIGIN=http://localhost:5173,https://your-frontend.vercel.app
OCR_MODEL=openai/gpt-4o
HEALTH_VALIDATE_CACHE_TTL=300
```

#### 2) Install Dependencies

```bash
cd ml
pip install -r requirements.txt
```

#### 3) Run Server

```bash
python test_server_pythonic.py
```

Useful endpoints:
- `GET /health` (validates token + readiness)
- `POST /extract` (multipart form field `image`)

---

### Frontend Setup

#### 1) Install Dependencies

```bash
cd frontend
npm install
```

#### 2) Environment Variables

Create `./frontend/.env` (or set Cloudflare Pages environment variables):

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_OCR_BASE_URL=http://localhost:5000
```

#### 3) Run Server

```bash
npm run dev
```

---

### Cloudflare Pages Deployment

Deploy only the `frontend/` directory to Cloudflare Pages. The backend remains a Node/Express service on Render, and the frontend calls it through `VITE_API_BASE_URL`.

1. In Cloudflare Pages, create a project from this repository and set the root directory to `frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set the Pages build environment to Node `22` (or any version satisfying `>=20.19.0`).
4. Add `VITE_API_BASE_URL` as a production environment variable using the public Render backend URL, without a trailing `/api` (for example, `https://your-backend.onrender.com`).
5. Add the Cloudflare Pages URL to the Render backend's `CORS_ORIGIN` variable. For a custom domain, include both the `*.pages.dev` URL and custom domain as comma-separated values.
6. Redeploy the backend after changing `CORS_ORIGIN`, then deploy Pages.
7. Verify `/health` on the backend, open the Pages URL, refresh nested routes such as `/upload` and `/schedule`, and test login plus one API-backed action.

The frontend includes `public/_redirects`, which preserves React Router routes on Cloudflare Pages refreshes. Do not commit `.env` files; configure secrets in Cloudflare Pages and Render dashboards.

---

### Backend Setup

#### 1) Install Dependencies

```bash
cd backend
npm install
```

#### 2) Environment Variables

Create a file named `.env` inside the `./backend/` directory:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_long_secure_secret_here
ACCESS_TOKEN_EXPIRY=1d

MONGO_URI_ATLAS=your_mongodb_atlas_connection_string

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Used by /api/predict proxy
DISEASE_MODEL_BASE=http://localhost:5001
```

#### 3) Run Server

```bash
npm run dev
```

Backend health endpoints:
- `GET /health`
- `GET /api/health`

---

### Disease Prediction Model Service (Optional, for `/api/predict`)

The backend's `/api/predict` is a proxy and expects a separate model server exposing:
- `GET /symptoms`
- `POST /predict`

This repo includes a deployable service under `./disease_model/`.

#### Environment Variables

Create `./disease_model/.env` with:

```env
MODEL_URL=https://drive.google.com/uc?export=download&id=...  # your model pickle
CORS_ORIGIN=http://localhost:5173,https://your-frontend.vercel.app
```

Then run locally:

```bash
cd disease_model
pip install -r requirements.txt
python app.py
```

---

## 📡 API Reference

### Backend (Express)

**Base URL (local):** `http://localhost:3000`

**Health**
- `GET /health`
- `GET /api/health`

**Users** (`/api/users`)
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/auth/me` (auth)
- `POST /api/users/logout` (auth)

**Prescriptions**
- `POST /api/prescriptions` (auth)
- `GET /api/prescriptions` (auth)
- `PUT /api/prescriptions/:id` (auth)
- `DELETE /api/prescriptions/:id` (auth)

**Schedules (Telegram)**
- `POST /api/schedules`

**Disease Prediction Proxy**
- `POST /api/predict`
- `GET /api/predict/symptoms`

**Debug** (for local debugging)
- `POST /api/debug/send`
- `GET /api/debug/schedules`

### OCR / ML Service (Flask)

**Base URL (local):** `http://localhost:5000`

- `GET /health`
- `POST /extract` (multipart/form-data, file field `image`)

### Disease Model Service (Flask)

**Base URL (local):** `http://localhost:5001`

- `GET /symptoms`
- `POST /predict`

---

## 🗺️ Project Roadmap

1. Initial design & scope finalization
2. Implement MERN stack setup with authentication & user profiles
3. Integrate OCR, AI Symptoms Predictor
4. Deploy production-ready health companion platform

---

## 🧩 Project Structure

<details>
<summary><b>📁 Folder layout</b></summary>

```
CareSentryAi/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── store/
│   │   └── api/
│   └── package.json
├── ml/
│   ├── requirements.txt
│   ├── Procfile
│   └── test_server_pythonic.py
└── disease_model/
		├── requirements.txt
		├── Procfile
		└── app.py
```

</details>
