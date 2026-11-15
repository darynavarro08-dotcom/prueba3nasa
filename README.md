# Stellar Health: Health Beyond Earth

<p align="center">
  <img src="Stellar%20Health%20Orbital%20Logo.png" alt="Stellar Health Logo" width="600">
</p>

**Team:** Sonora Space Health  
**Challenge:** [NASA Space Apps Challenge 2026 - Health Monitoring Software](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)

---

## 🗺️ Map of Contents
1. <a href="#sec-about">About the Project</a>
2. <a href="#sec-intro">Introduction</a>
3. <a href="#sec-video">Video</a>
4. <a href="#sec-run">Instructions to Run</a>
5. <a href="#sec-modules">User Manual & System Sections</a>
6. <a href="#sec-variables">Analysis of NASA Data & Biometric Variables</a>
7. <a href="#sec-alerts">Alert System & Decision Tree</a>
8. <a href="#sec-comparison">Commercial Models Comparison</a>
9. <a href="#sec-future">Future Plans</a>
10. <a href="#sec-files">File Descriptions</a>
11. <a href="#sec-science">Scientific Support & NASA HRP Grounding</a>
12. <a href="#sec-tech">Languages, Frameworks, Platforms & Technologies Used</a>
13. <a href="#sec-team">Team Members & Contributions</a>

---

<a id="sec-about"></a>
## 🚀 About the Project

In deep space, a late detection of any health alteration can jeopardize an astronaut's life. **Stellar Health** is an interactive physical and psychological health monitoring web application developed to support astronaut crews during long-duration space missions.

The software is structured around **three fundamental pillars** aimed at safeguarding crew health:
* **Prevention (Prevenir):** The system analyzes biometric data to evaluate physical condition, detect potential physical conditions early, and issue periodic notifications oriented toward mental health care.
* **Alert (Alertar):** Through continuous monitoring of health parameters, the software identifies physical or psychological anomalies. In critical or prolonged situations, it immediately deploys action protocols and notifies the rest of the crew.
* **Guidance (Aconsejar / Guiar):** The platform provides clear, structured guidelines that direct the astronaut step-by-step on how to effectively manage and resolve ongoing medical or emotional contingencies.

---

<a id="sec-intro"></a>
## 🌌 Introduction

Long-duration spaceflight exposes astronauts to **NASA's 5 Hazards of Human Spaceflight**:
1. **Space Radiation:** Increased exposure to cosmic rays and solar particle events.
2. **Isolation & Confinement:** Behavioral risks resulting from small group dynamics in confined spaces over extended periods.
3. **Distance from Earth:** Communication delays and the inability to receive rapid resupply or real-time medical intervention from ground control.
4. **Gravity Fields:** Physiological shifts in muscle mass, bone density, and cardiovascular function caused by microgravity.
5. **Hostile/Closed Environments:** Environmental stressors inside the habitat, including cabin pressure, microbial growth, and air quality.

Stellar Health addresses these risks by giving the crew total medical self-sufficiency and promoting a proactive shift from reactive medicine to preventive health management.

---

<a id="sec-video"></a>
## 📹 Video

<p align="center">
  <a href="https://youtu.be/GGPGJZ80UjA">
    <img src="(https://youtu.be/GGPGJZ80UjA)" alt="Stellar Health Nasa Space Apps Challenge 2026" width="700">
  </a>
</p>

---

<a id="sec-run"></a>
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

<a id="sec-modules"></a>
## 📖 User Manual & System Sections

The application interface is divided into 7 main operational modules:

### 1. HOME (Main Dashboard)
* **Body & Mind Status:** Visual indicator displaying health scores out of 100 for overall physical and psychological stability.
* **Latest Measurements:** Summary cards for temperature, heart rate, blood pressure, blood oxygenation (SpO2), respiration rate, blood glucose, radiation, and sleep efficiency.
* **Daily Exercise Routine:** Checklist featuring mandatory daily physical training.
* **AI Advisor:** Integrated AI assistant that provides guidance strictly formatted by the rule-based decision tree.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.10%20AM%20(1).jpeg" alt="Home Dashboard" width="700">
</p>

### 2. MIND (Psychological Care Plan)
* **Daily Emotional Check-in:** 5-point assessment of mood and tension levels.
* **Periodic Micro-interventions:** System-issued alerts scheduling 2 activities per day designed for space habitats.
* **Meditative Drawing Pad & Sound Player:** Tools for creative expression and acoustic decompression.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.11%20AM.jpeg" alt="Mind Section" width="700">
</p>

### 3. LOG (Personal Record & Journal)
* **Measurement Capture:** Form to record self-measured vitals, tagging state (Resting, Normal, Post-Exercise).
* **Personal Journal:** Private diary for logging qualitative notes and symptoms.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.11%20AM%20(1).jpeg" alt="Log Section" width="700">
</p>

### 4. TRAINING (Physical Countermeasures)
* **Session Stopwatch & Load Logbook:** Interactive timer and logging system to track weight loads.
* **Strength Trend Analysis:** Flags sustained drops in performance over time.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.11%20AM%20(2).jpeg" alt="Training Section" width="700">
</p>

### 5. DATA (Archive & Trends)
* **Dynamic Charts:** Historical trend plots spanning 7-day, 30-day, and 90-day intervals.
* **Data Export:** 1-click CSV file export.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.11%20AM%20(3).jpeg" alt="Data Section" width="700">
</p>

### 6. CREW (Team Status & Cohesion)
* **Crew Overview:** Real-time visibility of team members' overall body and mind status.
* **Shared Crew Alerts:** Broadcast system to request assistance.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.11%20AM%20(4).jpeg" alt="Crew Section" width="700">
</p>

### 7. GUIDES (Emergency Protocols)
* **Interactive Triage:** Step-by-step instructions for physical and psychological emergencies.

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.11%20AM%20(5).jpeg" alt="Guides Section" width="700">
</p>

---

<a id="sec-variables"></a>
## 📊 Analysis of NASA Data & Biometric Variables

Stellar Health evaluates physical indicators against normal expected values adapted for human spaceflight conditions:

| Measurement | Input Sensor / Method | Expected Spaceflight Values & Clinical Thresholds |
| :--- | :--- | :--- |
| **Heart Rate** | Photoplethysmography (PPG) / Smartwatch optical sensors | **50 – 70 bpm** at rest. Alert from 120 bpm. |
| **Blood Pressure** | Digital / Automatic Radiometer Cuff | **Normal:** <120/80 mmHg.<br>**Elevated:** 120-129 / <80 mmHg.<br>**Hypertension Stage 1:** 130-139 / 80-89 mmHg.<br>**Hypertension Stage 2:** ≥140/90 mmHg.<br>**Hypotension:** <90/60 mmHg. |
| **Blood Oxygen (SpO2)** | Pulse Oximeter | **Normal:** 95% – 100%.<br>**Consultation needed:** <94%.<br>**Emergency:** <90%. |
| **Body Temperature** | Digital Thermometer | **Normal:** 36.1 – 37.2 °C.<br>**Fever:** ≥38.0 °C.<br>**Hypothermia:** <35.0 °C. |
| **Respiration Rate** | Manual count / Direct measurement | **Normal Adult:** 12 – 20 breaths/min.<br>**Alert:** <12 or >20 breaths/min. |
| **Blood Glucose** | Glucometer | **Fasting Normal:** 70 – 99 mg/dL.<br>**Alert:** ≥126 mg/dL or <70 mg/dL. |
| **Radiation Exposure** | Personal Dosimeter | **Normal Dose Rate:** <50 µSv/h.<br>**Alert:** ≥100 µSv/h. |
| **Sleep & Actigraphy** | Actigraphy Sensor / Wrist Actiwatch | **Target Sleep:** ≥7 hours/night.<br>**Alert:** <6 hours/night. |

---

<a id="sec-alerts"></a>
## 🚦 Alert System & Decision Tree

Stellar Health enforces a **4-Level Priority System**:

<p align="center">
  <img src="WhatsApp%20Image%202026-11-15%20at%201.09.12%20AM%20(1).jpeg" alt="Alert System" width="700">
</p>

* 🟢 **Green (Stable):** All vital signs and mood scores remain within personal baseline ranges.
* 🔵 **Blue (Prevention / Mind):** Triggers habit reminders and psychological micro-interventions.
* 🟡 **Yellow (Watch / Alert):** Moderate deviation in one or more vital parameters.
* 🔴 **Red (Emergency):** Severe deviation (e.g., High Fever ≥ 38.0 °C, SpO2 < 90%). Activates a 30-second countdown to notify the crew.

---

<a id="sec-comparison"></a>
## ⚖️ Commercial Models Comparison

| Feature / Solution | Standard Commercial Fitness Apps | Generic Telemedicine Apps | Stellar Health |
| :--- | :---: | :---: | :---: |
| **Space-Adapted Ranges** | ❌ (Earth baselines only) | ❌ (Earth baselines only) | ✅ Space-specific physiological ranges |
| **Holistic Care (Body + Mind)** | ⚠️ (Physical or basic sleep) | ❌ (Focus on symptoms) | ✅ Integrated physical & psychological care |
| **Habitation Micro-interventions** | ❌ None | ❌ None | ✅ 2 daily tailored space-habitat tasks |
| **Rule-Based Emergency Triage** | ❌ None | ⚠️ Basic symptom checkers | ✅ 4-Level priority tree & crew alert broadcast |
| **Local Client Storage** | ❌ (Mandatory cloud sync) | ❌ (Mandatory cloud sync) | ✅ Local `localStorage` persistence |

---

<a id="sec-future"></a>
## 🔮 Future Plans

* **Dedicated Hardware Integration:** Incorporate custom biosensor hardware and wearable telemetry.
* **Expanded Predictive Analytics:** Enhance early-trend forecasting algorithms with NASA HRP Standard Measures.

---

<a id="sec-files"></a>
## 📁 File Descriptions

* **`index.html`**: Application markup, structural layout, modal dialogs, and navigation shell.
* **`styles.css`**: Minimalist dark-theme design system, responsive layouts, color-coded alert styling.
* **`js/`**: Modular application logic (`01_utilities.js`, `02_content.js`, `04_engine.js`, `06_interface.js`, etc.).

---

<a id="sec-science"></a>
## 🔬 Scientific Support & NASA HRP Grounding

* **NASA Human Research Program (HRP):** *5 Hazards of Human Spaceflight*, *Risks of Human Spaceflight*, *Spaceflight Standard Measures*.
* **Canadian Space Agency (CSA):** *Monitoring Radiation for Astronaut Health (CANS/EVARM)*.
* **American Heart Association (AHA):** Blood pressure & heart rate monitoring standards.

---

<a id="sec-tech"></a>
## 🛠️ Languages, Frameworks, Platforms & Technologies Used

* **Languages:** JavaScript (ES6+), CSS3, HTML5.
* **Client-Side Persistence:** Browser `localStorage` API.
* **AI Advisor Models:** Integration capabilities for Google Gemini API, Groq API, and OpenAI API.
* **Deployment:** Git, GitHub, Vercel.

---

<a id="sec-team"></a>
## 👥 Team Members & Contributions

**Team:** Sonora Space Health

* **Fernanda Campa Gallardo**
* **Dariana Navarro Galindo**
* **Omar Alejandro García Morán**
* **Julian Serrano Mungarro**

---
