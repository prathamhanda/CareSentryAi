# MedicReminder

* **Deployed Link:** [care-sentry.vercel.app](https://care-sentry-ai.vercel.app)

Caresentry AI is an intelligent health management platform designed to assist users with **medication reminders**, **quick symptom guidance**, and **AI-powered analysis** for minor health issues. Built with a focus on accessibility and reliability, it serves as a digital health companion for individuals and caregivers alike.

---

## Features
* **MERN-based Web App** – Full-stack application with a modern, scalable architecture.
* **Medication Scheduling & Reminders** – Automated Telegram notifications to prevent missed doses.
* **Prescription Digitization** – OCR-based scanning for easy tracking of medications.
* **AI Chatbot** – Symptom-checking assistant for instant health guidance.

---

## Target Users
* **Elderly Individuals** – Simplified interface for ease of use.
* **People with Chronic Conditions** – Consistent reminders and health monitoring.
* **Caregivers** – Better patient management tools.
* **General Health-Conscious Users** – Quick, reliable first-aid and symptom guidance.

**Key User Needs:**
* Simple, user-friendly design
* Large fonts & clear instructions
* Quick, reliable responses

---

## Security & Privacy
CareSentry AI prioritizes data protection with:
* End-to-end encryption for sensitive health data
* API calls secured with HTTPS & AES-256 encryption at rest
* JWT-based authentication with role-based access control

---

## Tech Stack
* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI/ML Components:** Symptom-checking chatbot & image analysis models
* **Communication:** WhatsApp & SMS integration

---

## Project Roadmap
1. Initial design & scope finalization
2. Implement MERN stack setup with authentication & user profiles
3. Integrate OCR, AI Symptoms Predictor
4. Deploy production-ready health companion platform

---
***
---

# 🚀 Project Setup Guide

This guide explains how to **install dependencies**, **configure environment variables**, and **run all servers** (Backend, Frontend, and ML) locally.

---

## Python/ML Setup
This setup is for the Python-based Machine Learning server.

### 1. Environment Variables
Create a file named **`.env`** inside the `./ml/` directory and add the following variable:

* GITHUB_API_KEY=your_github_api_key_here

### 2. Install Dependencies
Navigate to the ./ml/ directory and install the required Python packages:

* cd ml
* pip install -r requirements.txt

### 3. Run Server
Start the ML server:

* python test_server_pythonic.py

---

## Frontend Setup
This setup is for the web user interface.
### 1. Install Dependencies
Navigate to the ./frontend/ directory and install the required Node.js packages:

* cd frontend
* npm install

### 2. Run Server
* npm run dev

---

## Backend Setup
This setup is for the main application programming interface (API).
### 1. Environment Variables
Create a file named **`.env`** inside the `./backend/` directory and add the following variable:

* PORT=3000
* CORS_ORIGIN=http://localhost:5173
* ACCESS_TOKEN_SECRET=your_long_secure_secret_here
* ACCESS_TOKEN_EXPIRY=1h

### 2. Install Dependencies
Navigate to the ./backend/ directory and install the required Node.js packages:

* cd backend
* npm install

### 3. Run Server
* npm run dev

---
