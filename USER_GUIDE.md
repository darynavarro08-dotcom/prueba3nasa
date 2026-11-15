# STELLAR HEALTH — USER & OPERATIONAL GUIDE
> **Autonomous Health & Psychological Monitoring System for Deep-Space Missions**  
> *Developed for the NASA Space Apps Challenge (Challenge: Health Monitoring Software)*

---

## 📌 Executive Summary
**Stellar Health** is an offline-first, web-based autonomous medical and psychological monitoring software designed for astronaut crews on long-duration spaceflight missions (e.g., Artemis lunar outposts and Mars missions). In deep space, communication latencies of up to 22 minutes prevent real-time telemedicine during critical events. Stellar Health empowers astronaut autonomy through self-guided physiological tracking, rule-based medical triage, automated cross-crew emergency broadcasts, and a proactive psychological care framework.

The software addresses NASA's **5 Spaceflight Hazards**:
1. **Space Radiation** (Tracks cumulative mSv exposure via dosimeter inputs)
2. **Isolation and Confinement** (Proactive psychological micro-interventions & mood check-ins)
3. **Distance from Earth** (Autonomous decision trees & offline `localStorage` data persistence)
4. **Gravity Fields** (Countermeasure exercise routines preventing bone and muscle loss)
5. **Hostile Closed Environments** (Air quality, temperature, and environmental vital monitoring)

---

## 🚦 4-Level Color-Coded Triage System

Stellar Health automatically classifies all self-reported vitals into four distinct operational risk tiers:

| Risk Tier | Indicator | Physiological Criteria | Automated System Protocol |
| :--- | :--- | :--- | :--- |
| **🟢 GREEN** | Normal Status | Vitals within normal spaceflight baseline ranges. | Entry saved. No alert. Regular schedule continues. |
| **🔵 BLUE** | Prevention & Mind | Mild mood drift, fatigue, sleep debt (<6 hrs), or mild stress. | Prompts micro-interventions (drawing, Earth sounds, crew check-in) & AI advice. |
| **🟡 YELLOW** | Vigilance Needed | Low-grade fever (37.5°C–38.0°C), elevated BP, SpO2 92-94%, or persistent stress. | Flags status on Home dashboard; recommends rest & re-measurement within 2 hours. |
| **🔴 RED** | Severe Emergency | High fever (≥38.0°C), severe hypoxia (SpO2 <90%), or critical physiological distress. | **Triggers emergency protocol:** opens clinical guide, starts 30s countdown to broadcast alert to crew. |

---

## 📱 Module Breakdown (The 7 Core Sections)

### 1. HOME — System Command Dashboard
The **Home Dashboard** is the main landing screen providing a consolidated status of the astronaut's health:
* **Mind & Body Condition:** Summary of physical readiness and emotional score.
* **Biometric Measurement Cards:** Displays Heart Rate, Blood Pressure, SpO2, Temperature, Respiratory Rate, Glucose, and Radiation.
* **Today's Exercise Routine:** Overview of scheduled countermeasure workouts.
* **AI Advisor:** Context-aware assistant (Google Gemini / Groq / OpenAI) offering step-by-step guidance following clinical decision trees.
* **Prevention Measures & Microtask:** Daily mental health task recommendation.

---

### 2. MIND — Psychological Care Module
Designed to combat isolation, burnout, and emotional fatigue:
* **5-Factor Emotional Check-in:** Tracks Sadness, Irritability, Mood Swings, Anxiety, and Fear.
* **Daily Micro-interventions:** Two random daily tasks (e.g., drawing a flower, listening to Earth sounds, talking about a favorite movie).
* **Meditative Canvas & Soundscapes:** Interactive drawing pad and Earth audio (rain, ocean, forest).
* **Support Network Roster:** Direct access to Commander schedule adjustments, confidential Mission Psychologist sessions, and family video calls.

---

### 3. LOG — Biometric Input & Personal Journal
Handles quantitative vital tracking and qualitative logging:
* **Log a Measurement Modal:** Fields for self-measured vitals tagged by activity state (*Resting*, *Normal*, *Post-Exercise*).
* **Personal Journal (Bitácora):** Private log for sleep quality, symptoms, work stress, and personal notes.
* **Offline Storage:** Saved locally via browser `localStorage`.

---

### 4. TRAINING — Countermeasure Exercise Tracker
Protects against microgravity muscle atrophy and bone loss:
* **Countermeasure Routines:** ARED (Advanced Resistive Exercise Device) resistance protocols and cardio workouts.
* **Stopwatch & Load Logbook:** Tracks workout duration, weight loads, and repetitions.
* **Strength Loss Warnings:** Detects declining performance over time to flag potential musculoskeletal degradation.

---

### 5. DATA — Analytics & Telemedicine Export
Longitudinal data tracking for astronauts and ground control:
* **Interactive Trend Charts:** Graphs vital signs over days, weeks, and months.
* **1-Click CSV Export:** Generates standardized CSV medical summaries for transmission to Earth.
* **Spaceflight Baseline Table:** Reference guide for physiological norms in microgravity.

---

### 6. CREW — Team Status & Shared Alerts
Ensures crew cohesion and collective safety:
* **Crew Health Roster:** Real-time health status overview for all habitat members.
* **Shared Emergency Broadcasts:** Displays active alerts triggered by crewmates.
* **Privacy Protection:** Personal notes and mood logs remain private to the individual astronaut.

---

### 7. GUIDES — Emergency Clinical Protocols
Interactive first-aid and medical treatment manual:
* **Categorized Guides:** Step-by-step procedures for Fever/Hyperthermia, Hypothermia, Dehydration, Radiation Sickness, and Stress.
* **Automated Opening:** Triggered immediately when a Yellow or Red alert is logged.

---

## 🛠️ Tech Stack & Architecture
* **Frontend:** Vanilla Web Architecture (JavaScript 85.7%, CSS3 12.8%, HTML5 1.5%)
* **Dependencies:** Zero external framework overhead for ultra-lightweight execution.
* **Storage:** Browser `localStorage` API for client-side privacy.
* **Deployment:** Hosted on Vercel (`prueba3nasa.vercel.app`), GitHub repository (`darynavarro08-dotcom/prueba3nasa`).
