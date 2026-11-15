# Stellar Health: health beyond Earth

Web prototype (HTML + CSS + JS, no dependencies) that monitors the body and mind of a crew based on values each person measures on their own and enters in the app. There are no sensors or real-time data.

## Run

```sh
python3 -m http.server 8765
```

Open http://localhost:8765/index.html.

## What's included

- **Profile and health record**: age, weight, height, sex, and medical history. Used for maximum exercise heart rate, the guides, and the care plan. You can create new profiles.
- **Indicators**: temperature, heart rate, blood pressure, oxygen saturation, breathing, blood glucose, radiation, and sleep. You enter them yourself in **Log measurement**, noting whether you were at rest, doing normal activities, or right after exercise. Reference values are adapted to spaceflight (see **Data → Reference values in space**).
- **Training** page: an editable daily exercise checklist, a stopwatch, and a logbook of the weight used and performance, with a strength trend that flags sustained drops (possible muscle or bone loss). The checklist also appears on Home.
- **Daily exercise checklist** on Home, and **meditative drawing and sound** activities in Mind.
- **Prevention**: a personal model trained on your history; it flags trends before they become a problem.
- **Alerts and advice**: alerts when you save a measurement, step-by-step guides, and crew notification if something is serious or persists.
- **Psychological care plan**, mood check-ins, and simple periodic activities (drawing a flower, talking about your favorite movie…).
- A personal **Log** and a **data archive** (charts, table, and CSV).

Data and entries are saved in the browser's `localStorage`. This is not a medical device.

## Structure

`index.html`, `styles.css`, and `js/` (01 utilities, 02 content, 02b profile, 03 sample history, 04 engine, 05 charts, 06 interface, 07 actions and startup).

- **AI advisor** (Home): choose Groq or Google Gemini (both have free keys) or OpenAI, and paste your own API key (saved only in your browser). The AI explains what to do first following the priority tree (emergency, alert, watch, prevention, mind); the rule-based levels cannot be changed by it.
- **Measurement guides**: the (i) button on each measurement tile shows which ISS tool to use and how to measure. After each new measurement, if something is off, the AI advisor re-evaluates and suggests ISS tools for the situation.
