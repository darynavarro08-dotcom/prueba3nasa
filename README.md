# Stellar Health: Health Beyond Earth

<p align="center">
  <img src="Stellar_Health_Orbital_Logo.png" alt="Stellar Health Logo" width="600">
</p>

**Team:** Sonora Space Health  
**Challenge:** [NASA Space Apps Challenge 2026 - Health Monitoring Software](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)

---

## 🗺️ Map of Contents
1. [About the Project](#about-the-project)
2. [Introduction](#introduction)
3. [Video](#video)
4. [Instructions to Run](#instructions-to-run)
5. [User Manual & System Sections](#user-manual--system-sections)
6. [Analysis of NASA Data & Biometric Variables](#analysis-of-nasa-data--biometric-variables)
7. [Alert System & Decision Tree](#alert-system--decision-tree)
8. [Commercial Models Comparison](#commercial-models-comparison)
9. [Future Plans](#future-plans)
10. [File Descriptions](#file-descriptions)
11. [Scientific Support & NASA HRP Grounding](#scientific-support--nasa-hrp-grounding)
12. [Languages, Frameworks, Platforms & Technologies Used](#languages-frameworks-platforms--technologies-used)
13. [Team Members & Contributions](#team-members--contributions)

---

## 🚀 About the Project

In deep space, a late detection of any health alteration can jeopardize an astronaut's life. **Stellar Health** is an interactive physical and psychological health monitoring web application developed to support astronaut crews during long-duration space missions.

The software is structured around **three fundamental pillars** aimed at safeguarding crew health:
* **Prevention (Prevenir):** The system analyzes biometric data to evaluate physical condition, detect potential physical conditions early, and issue periodic notifications oriented toward mental health care.
* **Alert (Alertar):** Through continuous monitoring of health parameters, the software identifies physical or psychological anomalies. In critical or prolonged situations, it immediately deploys action protocols and notifies the rest of the crew.
* **Guidance (Aconsejar / Guiar):** The platform provides clear, structured guidelines that direct the astronaut step-by-step on how to effectively manage and resolve ongoing medical or emotional contingencies.

---

## 🌌 Introduction

Long-duration spaceflight exposes astronauts to **NASA's 5 Hazards of Human Spaceflight**:
1. **Space Radiation:** Increased exposure to cosmic rays and solar particle events.
2. **Isolation & Confinement:** Behavioral risks resulting from small group dynamics in confined spaces over extended periods.
3. **Distance from Earth:** Communication delays and the inability to receive rapid resupply or real-time medical intervention from ground control.
4. **Gravity Fields:** Physiological shifts in muscle mass, bone density, and cardiovascular function caused by microgravity.
5. **Hostile/Closed Environments:** Environmental stressors inside the habitat, including cabin pressure, microbial growth, and air quality.

Stellar Health addresses these risks by giving the crew total medical self-sufficiency and promoting a proactive shift from reactive medicine to preventive health management.

---

## 📹 Video

<p align="center">
  <a href="https://prueba3nasa.vercel.app/#inicio">
    <img src="https://img.youtube.com/vi/HrGC5vgw-mE/0.jpg" alt="Stellar Health Demo Video" width="800">
  </a>
</p>

---

## 💻 Instructions to Run

Stellar Health is built with a lightweight native web architecture (HTML5, CSS3, ES6 JavaScript) without external framework dependencies.

### Local Execution
To run the project locally using Python's built-in web server:

```bash
python3 -m http.server 8765
```

Then open your browser and navigate to:
`http://localhost:8765/index.html`

### Online Prototype
You can also access the live deployment directly at:
**[https://prueba3nasa.vercel.app](https://prueba3nasa.vercel.app)**

---

## 📖 User Manual & System Sections

The application interface is divided into 7 main operational modules:

### 1. HOME (Main Dashboard)
* **Body & Mind Status:** Visual indicator displaying health scores out of 100 for overall physical and psychological stability.
* **Latest Measurements:** Summary cards for temperature, heart rate, blood pressure, blood oxygenation ($\text{SpO}_2$), respiration rate, blood glucose, radiation, and sleep efficiency.
* **Daily Exercise Routine:** Checklist featuring mandatory daily physical training (warm-up, treadmill with harness, cycle ergometer, ARED resistive training, and cool-down).
* **AI Advisor:** Integrated AI assistant (supporting Google Gemini, Groq, or OpenAI API keys) that provides guidance strictly formatted by the rule-based decision tree.
* **Prevention & Mood Recommendations:** Early warning callouts and quick mental health prompts.

### 2. MIND (Psychological Care Plan)
* **Daily Emotional Check-in:** 5-point assessment of mood and tension levels.
* **Periodic Micro-interventions:** System-issued alerts scheduling **2 activities per day** designed for space habitats (e.g., drawing a flower from Earth, listening to Earth soundscapes, or sharing a favorite movie with a crewmate).
* **Meditative Drawing Pad & Sound Player:** Tools for creative expression and acoustic decompression.

### 3. LOG (Personal Record & Journal)
* **Measurement Capture:** Form to record self-measured vitals, tagging whether measurements were taken at rest, during normal activity, or post-exercise.
* **Personal Journal:** Private diary for logging qualitative notes, symptoms, and mission experiences.

### 4. TRAINING (Physical Countermeasures)
* **Session Stopwatch & Load Logbook:** Interactive timer and logging system to track weight loads used on exercise equipment.
* **Strength Trend Analysis:** Flags sustained drops in performance over time to warn against progressive muscle or bone density loss.

### 5. DATA (Archive & Trends)
* **Dynamic Charts:** Historical trend plots spanning 7-day, 30-day, and 90-day intervals.
* **Data Export:** 1-click CSV file export for record-keeping.
* **Space Reference Table:** Complete reference guide of physiological ranges adapted to microgravity.

### 6. CREW (Team Status & Cohesion)
* **Crew Overview:** Real-time visibility of team members' overall body and mind status.
* **Shared Crew Alerts:** Broadcast system that allows astronauts to request physical or emotional assistance from their crewmates.

### 7. GUIDES (Emergency Protocols)
* **Interactive Triage:** Clear step-by-step instructions for addressing physical anomalies (fever, tachycardia, hypoxia, hypo/hyperglycemia) and psychological distress.

---

## 📊 Analysis of NASA Data & Biometric Variables

Stellar Health evaluates physical indicators against normal expected values adapted for human spaceflight conditions:

| Measurement | Input Sensor / Method | Expected Spaceflight Values & Clinical Thresholds |
| :--- | :--- | :--- |
| **Heart Rate** | Photoplethysmography (PPG) / Smartwatch optical sensors | **50 – 70 bpm** at rest. (Lower values in space are generally non-anomalous). Alert from 120 bpm. |
| **Blood Pressure** | Digital / Automatic Radiometer Cuff | **Normal:** <120/80 mmHg.<br>**Elevated:** 120-129 / <80 mmHg.<br>**Hypertension Stage 1:** 130-139 / 80-89 mmHg.<br>**Hypertension Stage 2:** ≥140/90 mmHg.<br>**Hypotension:** <90/60 mmHg (concerning if symptomatic). |
| **Blood Oxygen ($\text{SpO}_2$)** | Pulse Oximeter | **Normal:** 95% – 100%.<br>**Consultation needed:** <94%.<br>**Medical Emergency:** <90%. |
| **Body Temperature** | Digital Thermometer | **Normal:** 36.1 – 37.2 °C.<br>**Low-grade fever:** 37.3 – 38.0 °C.<br>**Fever:** ≥38.0 °C.<br>**Hypothermia:** <35.0 °C. |
| **Respiration Rate** | Manual count / Direct measurement | **Normal Adult:** 12 – 20 breaths/min.<br>**Alert:** <12 or >20 breaths/min sustained. |
| **Blood Glucose** | Glucometer | **Fasting Normal:** 70 – 99 mg/dL.<br>**Alert (Fasting):** ≥126 mg/dL or <70 mg/dL.<br>**Emergency:** <54 mg/dL or ≥300 mg/dL. |
| **Radiation Exposure** | Personal Dosimeter | **Normal Dose Rate:** <50 µSv/h.<br>**Alert:** ≥100 µSv/h. |
| **Sleep & Actigraphy** | Actigraphy Sensor / Wrist Actiwatch | **Target Sleep:** ≥7 hours/night.<br>**Alert:** <6 hours/night across consecutive sessions or low sleep efficiency. |

---

## 🚦 Alert System & Decision Tree

Stellar Health enforces a **4-Level Priority System** to categorize health indicators at a glance:

```
[Level 1: Emergency] ➔ Immediate Red Alert + Crew Notification + Emergency Guide Deployment
[Level 2: Alert]     ➔ Yellow Alert + Protocol Instructions + AI Advisor Escalation
[Level 3: Watch]     ➔ Blue Alert + Trend Monitoring & Preventive Adjustments
[Level 4: Stable]    ➔ Green Status + Routine Maintenance & Psychological Well-being Check-in
```

* 🟢 **Green (Stable):** All vital signs and mood scores remain within personal baseline ranges.
* 🔵 **Blue (Prevention / Mind):** Triggers subtle habit reminders, sleep hygiene tips, or psychological micro-interventions.
* 🟡 **Yellow (Watch / Alert):** Moderate deviation in one or more vital parameters. Prompts confirmation readings and preventive adjustments.
* 🔴 **Red (Emergency):** Severe deviation (e.g., High Fever $\ge 38^\circ\text{C}$, $\text{SpO}_2 < 90\%$, Hypoglycemia $< 54\text{ mg/dL}$). Activates a 30-second countdown to automatically broadcast a high-priority alert to all crew members while presenting step-by-step first aid guides.

---

## ⚖️ Commercial Models Comparison

| Feature / Solution | Standard Commercial Fitness Apps | Generic Telemedicine Apps | Stellar Health |
| :--- | :---: | :---: | :---: |
| **Space-Adapted Ranges** | ❌ (Earth baselines only) | ❌ (Earth baselines only) | ✅ Space-specific physiological ranges |
| **Holistic Care (Body + Mind)** | ⚠️ (Physical or basic sleep) | ❌ (Focus on symptoms) | ✅ Integrated physical & psychological care |
| **Habitation Micro-interventions** | ❌ None | ❌ None | ✅ 2 daily tailored space-habitat tasks |
| **Rule-Based Emergency Triage** | ❌ None | ⚠️ Basic symptom checkers | ✅ 4-Level priority tree & crew alert broadcast |
| **Local Client Storage** | ❌ (Mandatory cloud sync) | ❌ (Mandatory cloud sync) | ✅ Local `localStorage` persistence |

---

## 🔮 Future Plans

* **Dedicated Hardware Integration:** Incorporate custom biosensor hardware and wearable telemetry to enable automatic, continuous data capture directly from the astronaut without manual entry.
* **Expanded Predictive Analytics:** Enhance early-trend forecasting algorithms by training models on larger spaceflight human research datasets (such as NASA HRP Standard Measures).

---

## 📁 File Descriptions

* **`index.html`**: Application markup, structural layout, modal dialogs, and navigation shell.
* **`styles.css`**: Minimalist dark-theme design system, responsive layouts, color-coded alert styling, and typography.
* **`js/`**: Modular application logic:
  * `01_utilities.js`: Helper functions and data formatting utilities.
  * `02_content.js`: Psychological activities, exercise routines, and guide content definitions.
  * `02b_profile.js`: User profile management and medical history setup.
  * `03_sample_history.js`: Baseline sample datasets for demonstration.
  * `04_engine.js`: Diagnostic engine, alert triggers, and priority decision tree calculations.
  * `05_charts.js`: Charting logic for historical data visualization.
  * `06_interface.js`: UI rendering, event handling, and DOM updates.
  * `07_actions.js`: Application startup procedures, LocalStorage sync, and AI Advisor API handlers.

---

## 🔬 Scientific Support & NASA HRP Grounding

Stellar Health builds upon research and guidelines provided by leading space agencies and health organizations:
* **NASA Human Research Program (HRP):** *5 Hazards of Human Spaceflight*, *Risks of Human Spaceflight*, and *Spaceflight Standard Measures (Actigraphy)*.
* **Canadian Space Agency (CSA):** *Monitoring Radiation for Astronaut Health (CANS/EVARM)* and *ISS Health Research*.
* **American Heart Association (AHA):** Blood pressure classification standards and heart rate monitoring guidelines.

---

## 🛠️ Languages, Frameworks, Platforms & Technologies Used

* **Languages:** JavaScript (ES6+), CSS3, HTML5.
* **Client-Side Persistence:** Browser `localStorage` API.
* **AI Advisor Models:** Integration capabilities for Google Gemini API, Groq API, and OpenAI API.
* **Deployment & Version Control:** Git, GitHub, and Vercel.
* **Development Support:** Programming optimization assisted by Claude.

---

## 👥 Team Members & Contributions

**Team:** Sonora Space Health

* **Fernanda Campa Gallardo**
* **Dariana Navarro Galindo**
* **Omar Alejandro García Morán**
* **Julian Serrano Mungarro**

---
