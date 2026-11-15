# Stellar Health: Health Beyond Earth

<p align="center">
  <img src="Stellar_Health_Orbital_Logo.png" alt="Stellar Health Logo" width="600">
</p>

**Team:** Sonora Space Health  
**Challenge:** [NASA Space Apps Challenge 2026 - Health Monitoring Software](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)  
**Live Prototype:** [prueba3nasa.vercel.app](https://prueba3nasa.vercel.app/)

---

## 🗺️ Map of Contents
1. [About the Project](#about-the-project)
2. [Introduction to the NASA Challenge](#introduction-to-the-nasa-challenge)
3. [Project Purpose & Importance](#project-purpose--importance)
4. [Video](#video)
5. [Instructions to Run](#instructions-to-run)
6. [User Manual & System Modules](#user-manual--system-modules)
7. [Analysis of NASA Data & Biometric Variables](#analysis-of-nasa-data--biometric-variables)
8. [Alert System & Decision Tree](#alert-system--decision-tree)
9. [Commercial Models Comparison](#commercial-models-comparison)
10. [Future Plans](#future-plans)
11. [File Descriptions](#file-descriptions)
12. [Scientific Support & NASA HRP Grounding](#scientific-support--nasa-hrp-grounding)
13. [Languages, Frameworks, Platforms & Technologies Used](#languages-frameworks-platforms--technologies-used)
14. [Team Members & Contributions](#team-members--contributions)

---

## 🚀 About the Project

In long-duration space missions, a late detection of any physical or psychological health alteration can jeopardize an astronaut's life and the overall mission success. **Stellar Health: Health Beyond Earth** is an interactive physical and psychological health monitoring web application developed to support astronaut crews during deep-space exploration.

The platform connects rigorous clinical tracking with simple, low-demand psychological routines. It is built upon **three core operational pillars**:

* **Prevention (Prevenir):** Evaluates physical vitals to detect potential health issues before they turn into emergencies, while issuing periodic notifications oriented toward continuous mental health care.
* **Alert (Alertar):** Monitors vital parameters to identify physical or emotional anomalies in real time. In critical or prolonged situations, it deploys emergency protocols and automatically alerts crewmates.
* **Guidance (Aconsejar / Guiar):** Delivers clear, step-by-step instructions that direct astronauts on how to manage and resolve medical contingencies independently.

---

## 🌌 Introduction to the NASA Challenge

The **NASA Space Apps Challenge (Health Monitoring Software for Astronauts on Space Missions)** tasks participants with developing software tools that allow space crews to evaluate and act upon their health status. 

Human spaceflight involves exposure to **NASA's 5 Hazards of Human Spaceflight**:
1. **Space Radiation:** High-energy cosmic rays and solar particle events that increase long-term cancer risks and tissue damage.
2. **Isolation & Confinement:** Small group dynamics in small habitats over long durations, leading to behavioral stress, depression, or inter-crew tension.
3. **Distance from Earth:** Communication delays and the impossibility of rapid evacuation or real-time medical direction from Ground Control.
4. **Gravity Fields:** Microgravity causes cardiovascular fluid shifts, bone mineral density loss, and muscle atrophy.
5. **Hostile/Closed Environments:** Habitat ecosystem factors including cabin pressure, microbial growth, lighting, and air quality.

Because deep-space missions to the Moon (Artemis program) and Mars require unprecedented autonomy, astronauts must carry the responsibility of monitoring, diagnosing, and treating health conditions in themselves and their crewmates.

---

## 🎯 Project Purpose & Importance

### Why Stellar Health is Vital
On Earth, medical care relies on immediate access to hospitals, specialists, and continuous diagnostic equipment. In deep space, communication lag with Earth can range from minutes to tens of minutes, making real-time telemedicine impossible during acute crises. 

**Stellar Health** shifts space medicine from **reactive intervention to proactive preventive analysis**:
* **Complete Crew Autonomy:** Enables astronauts to perform self-assessments, track trends over time, and follow step-by-step medical protocols without relying on Ground Control.
* **Holistic Dual-Focus (Body + Mind):** Physical health and mental stability are interdependent in extreme environments. Stellar Health is uniquely designed to address both physical vitals (heart rate, blood pressure, SpO2, glucose, radiation, sleep) and emotional well-being (mood, tension, crew bonding).
* **Mitigation of Operational Burnout:** Includes **two randomized daily micro-interventions** (such as drawing an Earth flower, listening to terrestrial soundscapes, or sharing stories with a crewmate) that take only 2–10 minutes, protecting crew morale without interfering with heavy mission workloads.
* **Local Data Privacy:** Operates with client-side browser persistence (`localStorage`), preserving medical privacy and ensuring resilient offline operation within the spacecraft or surface habitat.

---

## 📹 Video

<p align="center">
  <a href="https://prueba3nasa.vercel.app/#inicio">
    <img src="Stellar_Health_Orbital_Logo.png" alt="Stellar Health Demo Video" width="700">
  </a>
</p>

*(Demonstration video and interactive prototype available at [prueba3nasa.vercel.app](https://prueba3nasa.vercel.app))*

---

## 💻 Instructions to Run

Stellar Health is built with a lightweight native web architecture (HTML5, CSS3, ES6 JavaScript) developed with zero heavy external dependencies.

### Local Web Server
To launch the application locally using Python:

```bash
python3 -m http.server 8765
```

Navigate in your browser to:
`http://localhost:8765/index.html`

### Live Vercel Deployment
Access the hosted web application:
**[https://prueba3nasa.vercel.app](https://prueba3nasa.vercel.app)**

---

## 📖 User Manual & System Modules

The interface is organized into **7 primary operational modules**:

### 1. HOME (Main Dashboard)
* **Body & Mind Scores:** Dual health indicators showing physical score (0–100) and psychological score (0–100).
* **Vitals Panel:** Real-time displays for temperature, resting heart rate, blood pressure, blood oxygenation (SpO2), respiration rate, blood glucose, radiation dose rate, and sleep duration.
* **Today's Exercise Routine:** Interactive checklist for daily physical countermeasures (warm-up, treadmill with harness, cycle ergometer, ARED resistive training, cool-down).
* **AI Advisor:** Assistant powered by Google Gemini, Groq, or OpenAI API keys, strictly constrained by the rule-based decision tree to explain medical priorities without altering safety protocols.
* **Prevention Callouts & Mood Tasks:** Early trend notifications and quick daily micro-activities.

### 2. MIND (Psychological Care Plan)
* **Emotional Check-in:** Quick 5-level mood assessment (Very Bad to Very Good) and tension rating.
* **2 Daily Micro-interventions:** System-selected daily tasks tailored for space habitats (e.g., drawing a flower, listening to Earth soundscapes, crew caricature drawing).
* **Meditative Drawing Pad & Audio Player:** Embedded tools for creative expression and acoustic decompression.

### 3. LOG (Personal Journal & Symptoms)
* **Measurement Logger:** Form to enter self-measured vitals, categorized by physical state (*At rest*, *During normal activities*, *Right after exercise*).
* **Personal Log:** Private journal for logging qualitative symptoms, sleep observations, and personal notes.

### 4. TRAINING (Physical Countermeasures)
* **Session Stopwatch:** Interactive timer for workout tracking.
* **Load Logbook:** Record of weights used on ARED equipment and subjective difficulty.
* **Strength Trend Indicator:** Flags sustained strength loss over time to prevent muscle atrophy and bone demineralization.

### 5. DATA (Archive & Trends)
* **Historical Trend Charts:** Visual progress graphs over 7-day, 30-day, and 90-day periods.
* **CSV Data Export:** 1-click download of all stored medical logs.
* **Space Reference Table:** Complete reference guide detailing physiological normal ranges adapted to spaceflight.

### 6. CREW (Team Status & Cohesion)
* **Crew Status Board:** Real-time overview of crew members' body and mind readiness.
* **Mutual Assistance Broadcast:** Allows crew members to send physical or emotional support requests to crewmates.

### 7. GUIDES (Emergency Protocols)
* **Step-by-Step Triage:** Medical decision protocols for fever, tachycardia, hypoxia, hypo/hyperglycemia, hypothermia, panic attacks, and crew friction.

---

## 📊 Analysis of NASA Data & Biometric Variables

Physiological variables are evaluated against thresholds adapted for microgravity:

| Measurement | Input Sensor / Method | Expected Spaceflight Ranges & Triage Thresholds |
| :--- | :--- | :--- |
| **Heart Rate** | Photoplethysmography (PPG) / Smartwatch optical sensor | **Resting:** 50–70 bpm.<br>**Alert:** ≥120 bpm at rest. |
| **Blood Pressure** | Digital Radiometer Cuff | **Normal:** <120/80 mmHg.<br>**Stage 1:** 130–139 / 80–89 mmHg.<br>**Stage 2:** ≥140/90 mmHg.<br>**Hypotension:** <90/60 mmHg. |
| **Blood Oxygen (SpO2)** | Pulse Oximeter | **Normal:** 95%–100%.<br>**Watch:** <94%.<br>**Emergency:** <90%. |
| **Body Temperature** | Digital Thermometer | **Normal:** 36.1–37.2 °C.<br>**Low-grade fever:** 37.3–38.0 °C.<br>**High Fever:** ≥38.0 °C.<br>**Hypothermia:** <35.0 °C. |
| **Respiration Rate** | Manual count / Sensor | **Normal Adult:** 12–20 br/min.<br>**Alert:** <12 or >20 br/min. |
| **Blood Glucose** | Glucometer | **Fasting Normal:** 70–99 mg/dL.<br>**Watch (Fasting):** ≥126 mg/dL or <70 mg/dL.<br>**Emergency:** <54 mg/dL or ≥300 mg/dL. |
| **Radiation Exposure** | Personal Dosimeter | **Normal Dose Rate:** <50 µSv/h.<br>**Alert:** ≥100 µSv/h. |
| **Sleep & Actigraphy** | Actigraphy Sensor / Wrist Actiwatch | **Target Sleep:** ≥7 hours/night.<br>**Watch:** <6 hours/night across consecutive sessions. |

---

## 🚦 Alert System & Decision Tree

Stellar Health employs a **4-Level Priority Triage System**:

```
[Level 1: Emergency] ➔ High-priority Red Alert + 30s Countdown to Crew Broadcast + Step-by-Step Guide
[Level 2: Alert]     ➔ Yellow Alert + Clinical Instructions + AI Advisor Escalation
[Level 3: Watch]     ➔ Blue Alert + Trend Monitoring & Behavioral Adjustments
[Level 4: Stable]    ➔ Green Status + Routine Health Maintenance & Psychological Check-in
```

* 🟢 **Green (Stable):** Vitals and mood check-ins remain within baseline ranges.
* 🔵 **Blue (Prevention / Mind):** Triggers subtle habit reminders, sleep hygiene tips, or mental health micro-tasks.
* 🟡 **Yellow (Watch / Alert):** Moderate vital deviation. Prompts confirmation readings and preventive adjustments.
* 🔴 **Red (Emergency):** Critical health deviation (e.g., High Fever ≥38.0°C, SpO2 < 90%, Hypoglycemia < 54 mg/dL). Initiates a 30-second countdown to automatically broadcast a crew-wide emergency alert while launching guided first-aid procedures.

---

## ⚖️ Commercial Models Comparison

| Feature / Solution | Standard Commercial Fitness Apps | Generic Telemedicine Apps | Stellar Health |
| :--- | :---: | :---: | :---: |
| **Space-Adapted Ranges** | ❌ (Earth baselines only) | ❌ (Earth baselines only) | ✅ Space-specific physiological ranges |
| **Holistic Care (Body + Mind)** | ⚠️ (Physical or basic sleep) | ❌ (Focus on symptoms) | ✅ Integrated physical & psychological care |
| **Habitation Micro-interventions** | ❌ None | ❌ None | ✅ 2 daily space-habitat micro-tasks |
| **Rule-Based Emergency Triage** | ❌ None | ⚠️ Basic symptom checkers | ✅ 4-Level priority tree & crew alert broadcast |
| **Client Local Storage** | ❌ (Mandatory cloud sync) | ❌ (Mandatory cloud sync) | ✅ Local `localStorage` persistence |

---

## 🔮 Future Plans

* **Hardware Integration:** Integrate wearable biosensors and automated telemetry hardware to capture vitals continuously without requiring manual input.
* **Predictive ML Modeling:** Expand trend forecasting algorithms by training models on larger spaceflight datasets (such as NASA HRP Standard Measures).

---

## 📁 File Descriptions

* **`index.html`**: Application structure, navigation layout, modal dialogs, and UI shells.
* **`styles.css`**: Minimalist dark-theme design system, alert color coding, and responsive UI components.
* **`js/`**: Modular application logic:
  * `01_utilities.js`: Helper functions and data formatting tools.
  * `02_content.js`: Definitions for psychological tasks, exercise routines, and medical guides.
  * `02b_profile.js`: User profile management and medical history setup.
  * `03_sample_history.js`: Baseline sample datasets for demonstration.
  * `04_engine.js`: Diagnostic engine, alert triggers, and priority decision tree calculations.
  * `05_charts.js`: Dynamic charting logic for trend analysis.
  * `06_interface.js`: UI rendering, event handling, and DOM updates.
  * `07_actions.js`: Application startup, LocalStorage sync, and AI Advisor API handlers.

---

## 🔬 Scientific Support & NASA HRP Grounding

Stellar Health is grounded in guidelines and research from international space agencies:
* **NASA Human Research Program (HRP):** *5 Hazards of Human Spaceflight*, *Risks of Human Spaceflight*, and *Spaceflight Standard Measures (Actigraphy)*.
* **Canadian Space Agency (CSA):** *Monitoring Radiation for Astronaut Health (CANS/EVARM)* and *ISS Health Research*.
* **American Heart Association (AHA):** Cardiovascular classification standards and heart rate monitoring guidelines.

---

## 🛠️ Languages, Frameworks, Platforms & Technologies Used

* **Languages:** JavaScript (85.7%), CSS (12.8%), HTML (1.5%).
* **Client-Side Persistence:** Browser `localStorage` API.
* **AI Integration:** API connectivity supporting Google Gemini, Groq, and OpenAI models.
* **Deployment & Control:** Git, GitHub, Vercel.
* **Development Support:** Programming optimization assisted by Claude.

---

## 👥 Team Members & Contributions

**Team:** Sonora Space Health

* **Fernanda Campa Gallardo**
* **Dariana Navarro Galindo**
* **Omar Alejandro García Morán**
* **Julian Serrano Mungarro**

---
