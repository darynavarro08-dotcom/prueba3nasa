/* ===== Medical tools aboard the ISS and how to use them. Based on the Crew Health Care System (CHeCS); exact kit names vary by mission. ===== */
const MED_TOOLS = {
  temp: { name: 'Temperature', tool: 'Medical thermometer (ear/infrared, from the Health Maintenance System kit)',
    steps: ['Wash your hands and wait 15 minutes after exercise or a hot drink.', 'Put a clean probe cover on the thermometer.', 'Ear model: pull the ear gently back, insert the tip, press and hold until it beeps. Forehead model: aim at the center of the forehead, a few cm away.', 'Read the value and enter it in Log measurement. Measure twice and use the higher one if they differ.'],
    tip: 'In microgravity, body heat does not rise away from the skin, so readings can run a little higher. Compare with your own baseline.' },
  hr: { name: 'Heart rate', tool: 'Pulse sensor (PPG wrist band or finger clip) or the Crew Medical Restraint System monitor',
    steps: ['For a resting value, sit or float still for 5 minutes. Choose "At rest" when you log it.', 'Wear the PPG band snug on the wrist, with the light sensor against the skin. Keep the arm still.', 'Wait for the number to stabilize for 30 seconds, then read it.', 'No device: count the pulse at the wrist or neck for 30 seconds and multiply by 2.'],
    tip: 'Log a second value during normal activity and choose "During normal activities". They are judged differently.' },
  bp: { name: 'Blood pressure', tool: 'Automatic digital blood pressure cuff (part of the Advanced Life Support Pack monitor)',
    steps: ['Rest 5 minutes first, with no caffeine or exercise in the last 30 minutes.', 'Wrap the cuff on the bare upper arm, at heart level, with the tube along the inner arm. Secure the arm so it does not drift.', 'Press start and stay still and quiet while the cuff inflates and deflates.', 'Enter both numbers (systolic and diastolic). If the value is high, wait 5 minutes and measure again.'],
    tip: 'In space, pressure can change a little because of fluid shifts toward the head.' },
  spo2: { name: 'Blood oxygen', tool: 'Pulse oximeter (fingertip clip)',
    steps: ['Warm your hand if it is cold and remove nail polish.', 'Clip the sensor on a still fingertip, with the display facing up.', 'Stay still for 30 seconds until the reading is stable.', 'Enter the value. Below 94 %, measure again after 3 slow breaths and tell the Medical Officer.'],
    tip: 'Oxygen saturation does not change much in space, so a drop is worth attention.' },
  rr: { name: 'Respiration', tool: 'No instrument needed. Use a watch or timer (or the stopwatch on the Training page)',
    steps: ['Sit still and breathe normally, without trying to control it.', 'Count each full breath (in and out) for 60 seconds. Or count for 30 seconds and multiply by 2.', 'Enter the number as breaths per minute.'],
    tip: 'Breathing rate changes in space. Do not tell the person you are counting, as that alters it.' },
  glu: { name: 'Blood glucose', tool: 'Glucometer with lancet and test strips',
    steps: ['Wash and dry your hands. Insert a test strip into the meter.', 'Prick the side of a fingertip with a new lancet and let a small drop form.', 'Touch the drop to the strip and wait for the result.', 'Enter the value in mg/dL. Dispose of the lancet and strip in the sharps container.'],
    tip: 'For a fasting value, measure before eating, at least 8 hours after your last meal.' },
  rad: { name: 'Radiation', tool: 'Crew Passive Dosimeter (worn) and the station radiation monitors',
    steps: ['Wear your personal dosimeter at all times, as instructed.', 'Read the dose rate from the radiation monitor display in your module, or from the report sent by Mission Control.', 'Enter the dose rate in µSv/h.', 'If it is high, move to the best-shielded area (usually the crew quarters or the module Mission Control indicates).'],
    tip: 'Radiation is higher in space than on Earth. Passive dosimeters are read after the mission, so use the monitors for live values.' },
};
/* Tools the ISS has for each kind of problem, used by the AI advisor to suggest what to pick up. */
const ISS_KIT = {
  temp: ['Medical thermometer', 'Medical kit: fever reducer and fluids (only on Medical Officer advice)', 'Crew Medical Restraint System to rest safely'],
  hr: ['PPG pulse sensor', 'Advanced Life Support Pack monitor (ECG)', 'Crew Medical Restraint System'],
  bp: ['Automatic blood pressure cuff', 'Advanced Life Support Pack monitor'],
  spo2: ['Pulse oximeter', 'Respiratory Support Pack (oxygen, mask)', 'Crew Medical Restraint System'],
  rr: ['Timer or stopwatch', 'Respiratory Support Pack'],
  glu: ['Glucometer and strips', 'Medical kit: glucose source for low readings'],
  rad: ['Station radiation monitors', 'Crew Passive Dosimeter', 'Best-shielded module'],
  training: ['ARED resistance device', 'T2 treadmill', 'CEVIS cycle ergometer', 'Ultrasound for muscle and bone checks (with Medical Officer)'],
  mind: ['Crew psychological support (private conference with Flight Surgeon)', 'Guided breathing exercise in Mind'],
};
function toolSheet(k) {
  const t = MED_TOOLS[k];
  if (!t) return;
  openSheet('tool', { ic: 'pulse', title: `How to measure: ${t.name}`,
    body: `<p><b>Tool:</b> ${esc(t.tool)}</p><ol class="steps">${t.steps.map((x) => `<li><div class="step" style="cursor:default"><span>${esc(x)}</span></div></li>`).join('')}</ol><p class="note">${esc(t.tip)}</p><p class="hint">Exact equipment names can vary by mission. Ask the Medical Officer if your kit differs.</p>`,
    foot: `${footClose('Close')}<button class="btn btn-primary" data-act="med-open">${icon('plus')}Log measurement</button>` });
}
