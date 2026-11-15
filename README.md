# Stellar Health: Health Beyond Earth

<p align="center">
  <img src="Stellar_Health_Orbital_Logo.png" alt="Stellar Health Logo" width="600">
</p>

**Team:** Sonora Space Health  
**Challenge:** [NASA Space Apps Challenge 2026 - Health Monitoring Software](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)

---

<a id="map-of-contents"></a>
## 🗺️ Map of Contents
1. [NASA Space Apps Challenge & Project Overview](#project-overview)
2. [Project Importance & Core Purpose](#project-importance)
3. [Instructions to Run](#instructions-to-run)
4. [User Manual & System Sections](#system-sections)
   - [Home (Main Dashboard)](#sec-home)
   - [Mind (Psychological Care)](#sec-mind)
   - [Log (Biometric Logging & Journal)](#sec-log)
   - [Training (Physical Countermeasures)](#sec-training)
   - [Data (Trends & Export)](#sec-data)
   - [Crew (Team Health & Broadcasts)](#sec-crew)
   - [Guides (Emergency Protocols)](#sec-guides)
5. [Analysis of NASA Data & Biometric Variables](#nasa-data-variables)
6. [Alert System & Decision Tree](#alert-system)
7. [Commercial Models Comparison](#commercial-comparison)
8. [Future Plans](#future-plans)
9. [File Descriptions & Software Architecture](#file-descriptions)
10. [Scientific Support & NASA HRP Grounding](#scientific-support)
11. [Technologies Used](#technologies-used)
12. [Team Members & Contributions](#team-members)

---

<a id="project-overview"></a>
## 🚀 NASA Space Apps Challenge & Project Overview

During long-duration space exploration missions—such as lunar Artemis stays or future journeys to Mars—astronauts face unpredictable physical and psychological stressors. Ground control communication latencies (up to 20+ minutes each way for Mars) make immediate Earth-based clinical intervention impossible. 

**Stellar Health** was created in response to the **NASA Space Apps Challenge: Health Monitoring Software**. It is a self-sufficient, interactive health monitoring web application designed to empower astronaut crews with total medical and emotional autonomy.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.10_AM.jpeg" alt="Stellar Health Overview" width="650">
</p>

### The Three Pillars of Stellar Health:
* 🛡️ **Prevention (Prevenir):** Continuous analysis of physical parameters and automated scheduling of daily psychological micro-interventions to catch health declines before they turn into emergencies.
* 🚨 **Alert (Alertar):** Real-time monitoring against space-adapted physiological baselines, automatically escalating anomalies through a 4-level priority matrix and cross-notifying crewmates.
* 📋 **Guidance (Aconsejar / Guiar):** Step-by-step interactive clinical protocols and AI-assisted decision trees that walk astronauts through self-treatment and mitigation strategies.

---

<a id="project-importance"></a>
## 💡 Project Importance & Core Purpose

Human spaceflight subjects the human body and mind to **NASA's 5 Hazards of Human Spaceflight**:
1. **Space Radiation:** Cosmic rays and solar particle events cause long-term cellular and cardiovascular damage.
2. **Isolation & Confinement:** Extended confinement in cramped habitats leads to irritability, sleep disruption, depression, and crew conflict.
3. **Distance from Earth:** High communication delays require total onboard self-reliance for diagnosis and triage.
4. **Gravity Fields:** Microgravity causes rapid muscle atrophy, bone density loss, and fluid shifts affecting cardiac output.
5. **Hostile/Closed Environments:** Recirculated air, microbial accumulation, and habitability noise increase stress and respiratory risks.

Stellar Health addresses these combined hazards by integrating physical vital tracking with a proactive mental health regimen. Rather than treating symptoms after incapacitation occurs, Stellar Health builds habitability resilience and safeguards operational readiness throughout the mission.

---

<a id="instructions-to-run"></a>
## 💻 Instructions to Run

Stellar Health is engineered using a lightweight native web architecture (HTML5, CSS3, ES6 JavaScript) without heavy external framework dependencies.

### Local Execution
To launch the application locally using Python's built-in web server:

```bash
python3 -m http.server 8765
```

Then open your web browser and navigate to:
`http://localhost:8765/index.html`

### Online Prototype
Access the live deployment on Vercel:
**[https://prueba3nasa.vercel.app](https://prueba3nasa.vercel.app)**

---

<a id="system-sections"></a>
## 📖 User Manual & System Sections

<a id="sec-home"></a>
### 1. HOME (Main Dashboard)
The primary status overview displaying the astronaut's holistic condition.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.10_AM.jpeg" alt="Home Dashboard" width="650">
</p>

* **Body & Mind Scores:** Visual 0–100 indicators summarizing overall physiological and psychological health.
* **Biometric Cards:** Real-time values for Heart Rate, Blood Pressure, Oxygen Saturation ($	ext{SpO}_2$), Temperature, Respiration, Blood Glucose, Radiation, and Sleep.
* **Daily Exercise Routine:** Structured physical training plan featuring treadmill with harness, cycle ergometer, and ARED resistive workouts.
* **AI Advisor:** Decision-tree-guided AI assistant (compatible with Google Gemini, Groq, and OpenAI keys) offering clinical guidance.
* **Daily Mental Health Micro-task:** A quick, habitat-tailored psychological task assigned each day.

---

<a id="sec-mind"></a>
### 2. MIND (Psychological Care Plan)
Dedicated psychological wellness center focused on stress reduction and crew morale.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.10_AM_(1).jpeg" alt="Mind Module" width="650">
</p>

* **Daily Mood Check-in:** 5-point emotional assessment tracking mood, anxiety, and fatigue trends.
* **2 Daily Random Micro-interventions:** Habitat-friendly tasks (e.g., drawing an Earth flower, sharing stories, listening to terrestrial sounds).
* **Meditative Drawing Pad & Audio Player:** Digital tools for creative expression and acoustic decompression.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM.jpeg" alt="Sound Player and Drawing" width="600">
</p>

---

<a id="sec-log"></a>
### 3. LOG (Biometric Logging & Personal Journal)
Manual entry portal for self-measured vitals and qualitative journal logs.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(1).jpeg" alt="Log Module" width="650">
</p>

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.12_AM_(4).jpeg" alt="Log Measurement Modal" width="550">
</p>

* **Measurement Categorization:** Tag measurements taken at *Resting*, *Normal Activity*, or *Post-Exercise*.
* **Private Journal:** Log qualitative notes on symptoms, work fatigue, and sleep quality.

---

<a id="sec-training"></a>
### 4. TRAINING (Physical Countermeasures)
Physical conditioning module to prevent microgravity-induced muscle atrophy and bone loss.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(2).jpeg" alt="Training Module" width="650">
</p>

* **Stopwatch & Load Tracker:** Session timers and load input for ARED resistive training equipment.
* **Performance Drop Flags:** Automated warnings if sustained workload drops indicate physical deconditioning.

---

<a id="sec-data"></a>
### 5. DATA (Archive & Historical Trends)
Comprehensive analytics engine for long-term health monitoring.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(3).jpeg" alt="Data Analytics Module" width="650">
</p>

* **Trend Visualizations:** Interactive 7-day, 30-day, and 90-day vital sign plots.
* **1-Click Data Export:** Export full medical logs to CSV format for medical records.
* **Space Normative Table:** Clinical reference values adapted to microgravity physiology.

---

<a id="sec-crew"></a>
### 6. CREW (Team Health & Cohesion)
Shared crew status dashboard for mutual support and team situational awareness.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(4).jpeg" alt="Crew Module" width="650">
</p>

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.12_AM_(3).jpeg" alt="Crew Support Channels" width="550">
</p>

* **Crew Status Cards:** High-level health scores of crewmates while preserving private journal logs.
* **Support Channels:** Direct access to Commander check-ins, mission psychologist conferences, and family communication windows.

---

<a id="sec-guides"></a>
### 7. GUIDES (Emergency Protocols)
Step-by-step interactive triage and emergency first aid workflows.

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(5).jpeg" alt="Guides Module" width="650">
</p>

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(6).jpeg" alt="Body and Mind Emergency Guides" width="650">
</p>

* **Body Guides:** Clinical protocols for fever, hypothermia, tachycardia, hypoxia, and metabolic imbalance.
* **Mind Guides:** Psychological decompression steps for acute anxiety, panic, or burnout.

---

<a id="alert-system"></a>
## 🚦 Alert System & Decision Tree

Stellar Health utilizes a 4-level color-coded priority matrix to instantly communicate health status:

```
🟢 GREEN (Stable) ➔ Vitals within normal space baselines. Routine maintenance.
🔵 BLUE (Watch)   ➔ Minor trend drift. Habit tips & psychological micro-interventions.
🟡 YELLOW (Alert) ➔ Moderate anomaly. Confirmation re-test & preventive protocol.
🔴 RED (Emergency)➔ Severe anomaly. 30s countdown to broadcast alert to crew & open guide.
```

### Emergency Alert & Crew Broadcast Flow:

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.12_AM.jpeg" alt="Alert Measurement Saved" width="500">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.12_AM_(1).jpeg" alt="Emergency Countdown" width="500">
</p>

<p align="center">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.12_AM_(2).jpeg" alt="Crew Notified Status" width="500">
  <img src="WhatsApp_Image_2026-11-15_at_1.09.11_AM_(7).jpeg" alt="Active Crew Alert" width="500">
</p>

When a critical threshold is breached (e.g., Temperature $\ge 38.0^\circ	ext{C}$), the system automatically launches a 30-second countdown. If unacknowledged, it broadcasts an emergency call across all crew devices and opens the step-by-step emergency guide.

---

<a id="nasa-data-variables"></a>
## 📊 Analysis of NASA Data & Biometric Variables

| Biometric Variable | Measurement Sensor | Normal Space Baseline | Clinical Alert Threshold |
| :--- | :--- | :--- | :--- |
| **Heart Rate** | PPG / Optical Wrist Sensor | 50 – 70 bpm (resting) | $\ge 120$ bpm or $< 45$ bpm |
| **Blood Pressure** | Radiometer / Digital Cuff | $< 120/80$ mmHg | $\ge 140/90$ mmHg or $< 90/60$ mmHg |
| **Blood Oxygen ($	ext{SpO}_2$)** | Pulse Oximeter | 95% – 100% | $< 94\%$ (watch), $< 90\%$ (emergency) |
| **Body Temperature** | Digital Thermometer | 36.1 – 37.2 °C | $\ge 38.0^\circ	ext{C}$ (fever), $< 35.0^\circ	ext{C}$ (hypothermia) |
| **Respiration Rate** | Manual / Acoustic sensor | 12 – 20 breaths/min | $< 12$ or $> 20$ breaths/min |
| **Blood Glucose** | Fingerstick Glucometer | 70 – 99 mg/dL (fasting) | $\ge 126$ mg/dL or $< 70$ mg/dL |
| **Radiation Dose** | Personal Active Dosimeter | $< 50$ µSv/h | $\ge 100$ µSv/h |
| **Sleep Efficiency** | Actigraphy Wristwatch | $\ge 7$ hours/night | $< 6$ hours/night sustained |

---

<a id="commercial-comparison"></a>
## ⚖️ Commercial Models Comparison

| Feature | Standard Fitness Apps | Generic Telemedicine Apps | Stellar Health |
| :--- | :---: | :---: | :---: |
| **Spaceflight Physiological Ranges** | ❌ Earth baselines only | ❌ Earth baselines only | ✅ Tailored spaceflight baselines |
| **Holistic Body + Mind Integration** | ⚠️ Physical only | ❌ Symptom focus only | ✅ Vitals + daily mental interventions |
| **Space Habitat Micro-tasks** | ❌ None | ❌ None | ✅ 2 daily habitat-tailored tasks |
| **Automated Crew Broadcast Triage** | ❌ None | ❌ None | ✅ 4-level triage with auto-broadcast |
| **Client Data Privacy & Security** | ❌ Cloud dependent | ❌ Cloud dependent | ✅ Local browser storage persistence |

---

<a id="future-plans"></a>
## 🔮 Future Plans

* **Biosensor Hardware Integration:** Directly interface with wearable telemetry devices for automated streaming of vital signs.
* **Advanced Predictive AI:** Train predictive neural network models on NASA HRP datasets to forecast fatigue and physiological degradation days in advance.

---

<a id="file-descriptions"></a>
## 📁 File Descriptions & Software Architecture

* **`index.html`**: Complete UI structure, navigation tabs, modal dialogs, and SVG visual assets.
* **`styles.css`**: Dark space-theme design system, responsive grid layouts, and color-coded alert styling.
* **`js/`**: Modular ES6 JavaScript engine:
  * `01_utilities.js`: Data formatting, unit conversions, and mathematical helpers.
  * `02_content.js`: Psychological micro-interventions, exercise routines, and clinical guides.
  * `02b_profile.js`: User profile setup and health baseline initialization.
  * `03_sample_history.js`: Pre-loaded historical datasets for demonstration.
  * `04_engine.js`: Diagnostic engine, threshold evaluations, and 4-level triage logic.
  * `05_charts.js`: Dynamic Canvas/SVG plotting for temporal data analytics.
  * `06_interface.js`: DOM rendering, event listeners, and active view switching.
  * `07_actions.js`: Application startup, LocalStorage sync, and AI Advisor API integration.

---

<a id="scientific-support"></a>
## 🔬 Scientific Support & NASA HRP Grounding

Stellar Health's clinical rules and protocols are grounded in research from leading space agencies:
* **NASA Human Research Program (HRP):** *5 Hazards of Human Spaceflight*, *Risks of Human Spaceflight*, and *Spaceflight Standard Measures*.
* **Canadian Space Agency (CSA):** *Monitoring Radiation for Astronaut Health (EVARM/CANS)* and *ISS Health Research*.
* **American Heart Association (AHA):** Blood pressure classifications and cardiac monitoring standards.

---

<a id="technologies-used"></a>
## 🛠️ Technologies Used

* **Core Languages:** JavaScript (ES6+), CSS3, HTML5.
* **Data Storage:** Browser `localStorage` API.
* **AI Advisor Connectivity:** API support for Google Gemini, Groq, and OpenAI models.
* **Deployment & Version Control:** Git, GitHub, Vercel.

---

<a id="team-members"></a>
## 👥 Team Members & Contributions

**Team:** Sonora Space Health

* **Fernanda Campa Gallardo**
* **Dariana Navarro Galindo**
* **Omar Alejandro García Morán**
* **Julian Serrano Mungarro**

---
