/* ===== Sample mission and crew ===== */
const MISSION = { name: 'Aurora Expedition', day: 127, total: 180 };
const CREW = [
  { id: 'amara', name: 'Amara Okafor', short: 'Amara', role: 'Flight Engineer', ini: 'AO', story: 'infeccion', need: 7.5, exAt: 960,
    base: { temp: 36.6, hr: 58, rr: 14, spo2: 98, sleep: 7.5, mood: 4.0, stress: 2.0 }, likes: ['dibujo', 'música', 'plantas'] },
  { id: 'kenji', name: 'Kenji Mori', short: 'Kenji', role: 'Medical Officer', ini: 'KM', story: 'sueno', need: 7.5, exAt: 510,
    base: { temp: 36.4, hr: 62, rr: 13, spo2: 97.4, sleep: 7.2, mood: 3.8, stress: 2.4 }, likes: ['lectura', 'ajedrez', 'fotografía'] },
  { id: 'valentina', name: 'Valentina Reyes', short: 'Valentina', role: 'Commander', ini: 'VR', story: 'estable', need: 7.5, exAt: 1050,
    base: { temp: 36.7, hr: 55, rr: 12, spo2: 98, sleep: 7.7, mood: 4.2, stress: 2.2 }, likes: ['música', 'cocina', 'ejercicio'] },
  { id: 'lucas', name: 'Lucas Ferreira', short: 'Lucas', role: 'Science Specialist', ini: 'LF', story: 'animo', need: 8, exAt: 660,
    base: { temp: 36.5, hr: 64, rr: 15, spo2: 97.6, sleep: 7.5, mood: 3.9, stress: 2.3 }, likes: ['cine', 'escritura', 'fotografía'] },
];
const crewById = (id) => CREW.find((c) => c.id === id);

/* Simulated history for each crew member: deviations by day (0 = today, 1 = yesterday…) */
const pick = (arr, o) => (o < arr.length ? arr[o] : 0);
const STORY = {
  estable: () => ({}),
  infeccion: (o) => ({ temp: pick([0.55, 0.42, 0.28, 0.12], o), hr: pick([8, 6, 4, 2], o), rr: pick([1.4, 1, 0.5], o), sleep: pick([-0.8, -0.5], o), mood: pick([-0.5, -0.3], o), eff: pick([-0.05, -0.03], o) }),
  sueno: (o) => ({ sleep: pick([-2.1, -1.8, -2.0, -1.5, -1.7, -1.1, -0.6], o), eff: o <= 6 ? -0.06 : 0, mood: pick([-0.5, -0.4, -0.3, -0.2], o), stress: pick([0.6, 0.5, 0.4, 0.3, 0.2], o), hr: pick([4, 3, 3, 2, 2], o) }),
  animo: (o) => ({ mood: pick([-1.9, -1.9, -1.8, -1.6, -1.4, -1.1, -0.8, -0.5, -0.2], o), stress: o <= 5 ? 0.5 : 0, sleep: o <= 4 ? -0.5 : 0, eff: o <= 4 ? -0.04 : 0, ex: o <= 4 ? -0.4 : 0 }),
};

/* ===== Levels ===== */
const LV = { ok: 0, watch: 1, alert: 2, emergency: 3 };
const LVN = ['ok', 'watch', 'alert', 'emergency'];
const LEVELS = {
  ok: { label: 'Stable', ic: 'check' },
  watch: { label: 'Watch', ic: 'eye' },
  alert: { label: 'Alert', ic: 'alert' },
  emergency: { label: 'Emergency', ic: 'octagon' },
};
const maxLv = (arr) => LVN[arr.reduce((m, x) => Math.max(m, LV[x.level] || 0), 0)];

/* ===== Mood ===== */
const MOODS = [
  { v: 1, label: 'Very bad', mouth: 'M8.2 16.6q3.8-3.6 7.6 0', brow: 'M7.6 8.2l2.6 1M16.4 8.2l-2.6 1' },
  { v: 2, label: 'Bad', mouth: 'M8.4 16q3.6-2.2 7.2 0' },
  { v: 3, label: 'Okay', mouth: 'M8.6 15.4h6.8' },
  { v: 4, label: 'Good', mouth: 'M8.4 14.6q3.6 2.6 7.2 0' },
  { v: 5, label: 'Very good', mouth: 'M7.8 13.8q4.2 4.8 8.4 0' },
];
const TENSION = ['None', 'A little', 'Some', 'Quite a bit', 'A lot'];
const faceSvg = (v, cls = '') => { const m = MOODS[clamp(Math.round(v), 1, 5) - 1]; return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9 10h.01M15 10h.01" stroke-width="2.6"/><path d="${m.mouth}"/>${m.brow ? `<path d="${m.brow}"/>` : ''}</svg>`; };
const moodLabel = (v) => MOODS[clamp(Math.round(v), 1, 5) - 1].label;

/* ===== Conditions detected by the engine ===== */
const cnd = (dom, guide, n, u, dec, s) => ({ dom, guide, n, u, dec, s });
const COND = {
  fiebre_alta: cnd('cuerpo', 'fiebre', 'high fever', '°C', 1, 'Your temperature is far above the safe range. Follow the guide now.'),
  fiebre: cnd('cuerpo', 'fiebre', 'fever', '°C', 1, 'Your temperature went over 38 °C. Stop what you’re doing and follow the guide.'),
  febricula: cnd('cuerpo', 'fiebre', 'slightly elevated temperature', '°C', 1, 'It’s not a fever yet. Rest, drink water and measure again in a while.'),
  temp_desv: cnd('cuerpo', 'fiebre', 'temperature above your usual range', '°C', 1, 'This is normal for most people, but high for you.'),
  hipotermia: cnd('cuerpo', 'frio', 'very low temperature', '°C', 1, 'Your body is losing too much heat. Follow the guide now.'),
  temp_baja: cnd('cuerpo', 'frio', 'low temperature', '°C', 1, 'Measure again with your thermometer and bundle up.'),
  taqui_grave: cnd('cuerpo', 'taquicardia', 'very fast resting heart rate', 'bpm', 0, 'Your heart is beating very fast without exertion. Stop and follow the guide now.'),
  taqui: cnd('cuerpo', 'taquicardia', 'fast resting heart rate', 'bpm', 0, 'Your heart is beating fast even though you’re not moving. Stop and breathe slowly.'),
  hr_alta: cnd('cuerpo', 'taquicardia', 'slightly elevated resting heart rate', 'bpm', 0, 'Take a break, drink water and measure again.'),
  hr_desv: cnd('cuerpo', 'taquicardia', 'heart rate above your usual range', 'bpm', 0, 'This is normal in general, but high for you.'),
  bradi_grave: cnd('cuerpo', 'bradicardia', 'very slow heart rate', 'bpm', 0, 'Your heart is beating very slowly. Follow the guide now.'),
  bradi: cnd('cuerpo', 'bradicardia', 'slow heart rate', 'bpm', 0, 'If you feel dizzy or weak, let someone know.'),
  taquipnea_grave: cnd('cuerpo', 'respiracion', 'very fast breathing', 'br/min', 0, 'You’re breathing too fast at rest. Follow the guide now.'),
  taquipnea: cnd('cuerpo', 'respiracion', 'fast breathing', 'br/min', 0, 'You’re breathing fast without exertion. Sit upright and exhale slowly.'),
  rr_alta: cnd('cuerpo', 'respiracion', 'slightly fast breathing', 'br/min', 0, 'Take a break and breathe slowly.'),
  rr_desv: cnd('cuerpo', 'respiracion', 'breathing above your usual range', 'br/min', 0, 'This is normal in general, but high for you.'),
  bradipnea_grave: cnd('cuerpo', 'respiracion_lenta', 'very slow breathing', 'br/min', 0, 'You’re breathing too slowly. Follow the guide now.'),
  bradipnea: cnd('cuerpo', 'respiracion_lenta', 'slow breathing', 'br/min', 0, 'Take a few deep breaths and measure again.'),
  hipoxia_grave: cnd('cuerpo', 'oxigeno', 'very low oxygen', '%', 0, 'Your blood is carrying very little oxygen. Follow the guide now.'),
  hipoxia: cnd('cuerpo', 'oxigeno', 'low oxygen', '%', 0, 'Your saturation dropped below 94 %. Stop exerting yourself and follow the guide.'),
  spo2_baja: cnd('cuerpo', 'oxigeno', 'slightly low oxygen', '%', 0, 'Check how you measured, take a deep breath and measure again.'),
  spo2_desv: cnd('cuerpo', 'oxigeno', 'oxygen below your usual range', '%', 0, 'This is acceptable in general, but low for you.'),
  ansiedad: cnd('mente', 'ansiedad', 'signs of acute anxiety', '', 0, 'Your heart rate and breathing sped up without exertion or fever. It may be anxiety or intense stress: breathe with me.'),
};
const condVal = (code, v) => { const c = COND[code]; return c.fmt ? c.fmt(v) : c.u ? `${fx(v, c.dec)} ${c.u}` : ''; };
const condTitle = (code, v) => { const c = COND[code]; return c.u ? `${cap(c.n)}: ${condVal(code, v)}` : cap(c.n); };
const condInline = (code, v) => { const c = COND[code]; return c.u ? `${c.n} (${condVal(code, v)})` : c.n; };

/* ===== Emergency guides ===== */
const GUIDES = {
  fiebre: { dom: 'cuerpo', ic: 'thermo', title: 'Fever or high temperature', when: 'Temperature of 38 °C or higher. Low-grade fever from 37.3 °C.',
    what: 'Your body is hotter than normal. It’s almost always its way of fighting an infection.',
    steps: [
      ['Stop and rest', 'Drop the task, go to your crew quarters or a ventilated area and say you’re stepping away.'],
      ['Confirm the reading', 'Check that your instrument is placed correctly, measure again after 5 minutes and note the new value.'],
      ['Drink water', 'One glass (250 ml) every hour. With a fever you dehydrate faster.'],
      ['Cool down, but not too much', 'Remove layers of clothing and place a damp, lukewarm cloth on your forehead and neck.'],
      ['Talk to the Medical Officer', 'They’ll tell you whether to take the fever reducer from the medical kit and how often.'],
      ['Look after others', 'Infections spread fast in a closed spacecraft: wear a mask and clean what you touch.'],
      ['Note your symptoms', 'Cough, pain, chills, nausea. Write them in the Log with the time.'],
    ],
    urgent: ['Your temperature reaches 39.5 °C or rises very fast.', 'You have trouble breathing, feel confused or very drowsy.', 'You have a stiff neck, skin rash or intense pain.', 'The fever lasts more than 24 hours.'],
    avoid: ['Exercising or continuing physical work.', 'Using ice-cold cloths or bundling up too much.', 'Taking medication without the Medical Officer knowing.'],
    helper: ['Accompany the person to their crew quarters and bring them water.', 'Measure their temperature every 30 minutes and note it down.', 'Inform Mission Control in the next communication window.'] },
  frio: { dom: 'cuerpo', ic: 'thermo', title: 'Low body temperature', when: 'Temperature below 35.5 °C.',
    what: 'Your body is losing heat faster than it produces it. Sometimes it’s just a bad reading or a cold area of the spacecraft.',
    steps: [
      ['Measure again', 'Place the thermometer properly and wait 3 minutes before measuring again.'],
      ['Bundle up', 'Dry clothes, a hat and the thermal blanket from the medical kit.'],
      ['Have something warm and sweet', 'Only if you’re fully awake and can swallow without trouble.'],
      ['Move gently', 'Move your arms and legs without working up a sweat.'],
      ['Check the module temperature', 'If it’s cold, move to another area and report it so it can be checked.'],
      ['Measure again', 'After 15 minutes, check that your temperature is rising.'],
    ],
    urgent: ['Your temperature drops below 35 °C.', 'The shivering won’t stop, or suddenly disappears while you’re still cold.', 'You speak slowly or feel clumsy or confused.', 'You feel extremely sleepy.'],
    avoid: ['Applying direct heat or very hot water to the skin.', 'Staying still and alone.'],
    helper: ['Cover the person with blankets, including the head.', 'Don’t leave them alone and talk to them to see how they respond.', 'Notify the Medical Officer.'] },
  taquicardia: { dom: 'cuerpo', ic: 'heart', title: 'Fast resting heart rate', when: 'Over 100 beats per minute without exertion. Alert from 120.',
    what: 'Your heart is beating faster than normal even though you’re not moving. It can be due to fever, dehydration, caffeine, pain, lack of sleep or stress.',
    steps: [
      ['Stop and hold on', 'Anchor yourself somewhere comfortable and loosen tight clothing.'],
      ['Breathe slowly for two minutes', 'Inhale for 4 seconds through your nose and exhale for 6 through your mouth.'],
      ['Review possible causes', 'Did you have caffeine? Do you have a fever? Have you drunk too little? Did something scare you, or are you very tense?'],
      ['Drink water', 'A glass, slowly.'],
      ['Measure again after 5 minutes', 'Normally your heart rate starts to drop.'],
      ['If it stays above 120 after 10 minutes', 'Tell the Medical Officer even if you feel fine.'],
    ],
    urgent: ['Chest pain or pressure.', 'Shortness of breath.', 'Severe dizziness, fainting or blurred vision.', 'Irregular heartbeat or a resting heart rate of 140 or more.'],
    avoid: ['Having more caffeine or energy drinks.', 'Continuing to work to see if it passes.', 'Staying alone if you feel dizzy.'],
    helper: ['Stay with the person and take their pulse at the wrist.', 'Keep the medical kit and the defibrillator (AED) at hand.', 'If they lose consciousness and aren’t breathing: start CPR as in training and get the AED.'], tool: 'respirar' },
  bradicardia: { dom: 'cuerpo', ic: 'heart', title: 'Very slow heart rate', when: 'Fewer than 42 beats per minute while awake.',
    what: 'Your heart is beating slower than usual. In highly trained people it can be normal, especially at rest. It matters when it comes with dizziness or weakness.',
    steps: [
      ['Notice how you feel', 'If you feel fine and not dizzy, it may be normal for you.'],
      ['Get active for a minute', 'Move your arms and legs and see if your heart rate rises.'],
      ['Measure again', 'Count your pulse for a full minute, sitting still.'],
      ['Think about medications', 'Note whether you took anything for sleep, pain or blood pressure.'],
      ['If you notice symptoms, tell someone', 'Dizziness, weakness or shortness of breath: call the Medical Officer.'],
    ],
    urgent: ['Dizziness, weakness or fainting.', 'Chest pain or shortness of breath.', 'Confusion.', 'Heart rate below 35 beats per minute.'],
    avoid: ['Ignoring it if you feel weak.', 'Doing risky tasks without company.'],
    helper: ['Stay with the person and make sure they respond.', 'Keep the defibrillator (AED) at hand.', 'If they don’t respond and aren’t breathing: CPR as in training.'] },
  respiracion: { dom: 'cuerpo', ic: 'wind', title: 'Fast breathing', when: 'More than 20 breaths per minute at rest. Alert from 24.',
    what: 'You’re breathing faster than normal. It could be from recent exertion, fever, anxiety or because the cabin air has too much CO₂.',
    steps: [
      ['Sit upright', 'Straight back, relaxed shoulders and an open chest.'],
      ['Breathe with pursed lips', 'Inhale for 2 seconds through your nose and exhale for 4 through your mouth, as if blowing out a candle. Two minutes.'],
      ['Check your blood oxygen', 'If it’s below 94 %, also open the low oxygen guide.'],
      ['Check the cabin air', 'Look at the CO₂ on the environment panel. If it’s high or several people have headaches, change modules and report it.'],
      ['Look for the cause', 'If you have a fever or are very nervous, follow that guide.'],
      ['Measure again after 5 minutes', 'Your breathing should be slowing down.'],
    ],
    urgent: ['30 breaths per minute or more at rest.', 'Bluish lips or nails.', 'You can’t say a full sentence without stopping to breathe.', 'Chest pain when breathing.'],
    avoid: ['Breathing into a bag.', 'Hunching over: keep your chest open.', 'Staying alone.'],
    helper: ['Breathe slowly next to them so they follow your rhythm.', 'Check their oxygen and the module air.', 'Prepare the portable oxygen in case the Medical Officer calls for it.'], tool: 'respirar' },
  respiracion_lenta: { dom: 'cuerpo', ic: 'wind', title: 'Very slow breathing', when: 'Fewer than 10 breaths per minute.',
    what: 'You’re breathing very slowly. It can happen in deep sleep, with sleep or pain medications, or if CO₂ builds up around your face.',
    steps: [
      ['Take five deep breaths', 'Then move around a little to wake yourself up.'],
      ['Measure again', 'Count your breaths for a full minute, sitting still.'],
      ['Check your blood oxygen', 'If it drops below 94 %, open the low oxygen guide.'],
      ['Check the ventilation', 'Without airflow, the CO₂ you exhale stays around your head. Make sure the fan in your crew quarters is working.'],
      ['Think about medications', 'If you took something for sleep or pain, tell the Medical Officer.'],
    ],
    urgent: ['Fewer than 8 breaths per minute.', 'The person won’t wake up or barely responds.', 'Oxygen below 90 %.', 'Long pauses between breaths.'],
    avoid: ['Going back to sleep without checking the ventilation.', 'Taking another dose of a sleep medication.'],
    helper: ['Speak loudly and tap their shoulder to wake them.', 'If they don’t respond: open the airway, check for breathing and call for help.', 'Prepare oxygen and follow your first aid training.'] },
  oxigeno: { dom: 'cuerpo', ic: 'drop', title: 'Low blood oxygen', when: 'Saturation below 94 %. Emergency below 90 %.',
    what: 'Your blood is carrying less oxygen than it needs. It could be a breathing problem, a cabin air problem or just a bad pulse oximeter reading.',
    steps: [
      ['Stop all exertion', 'Stay still, upright and with your chest open.'],
      ['Measure again', 'Cold fingers or a badly placed oximeter give low readings. Place it properly, wait a minute and measure again.'],
      ['Breathe slowly and deeply', 'Inhale through your nose and exhale slowly with pursed lips.'],
      ['Check the cabin air', 'Look at the O₂ and CO₂ on the environment panel. If there’s an atmosphere alarm, follow that procedure and use the portable oxygen mask.'],
      ['Call for help if it doesn’t improve', 'If you’re still below 90 % after 3 minutes, call the crew. The Medical Officer may order supplemental oxygen.'],
    ],
    urgent: ['Saturation of 85 % or less.', 'Bluish lips or nails.', 'Confusion, heavy drowsiness or dizziness.', 'Severe shortness of breath or getting worse.'],
    avoid: ['Continuing to work or exercise.', 'Staying alone in a closed module.', 'Relying on a single reading: measure again.'],
    helper: ['Bring the portable oxygen and stay with the person.', 'Check the module air before entering.', 'Inform Mission Control.'], tool: 'respirar' },
  sueno: { dom: 'cuerpo', ic: 'moon', title: 'Lack of sleep', when: 'Less than 6 hours a night for several nights, or very interrupted sleep.',
    what: 'Sleeping little for several days lowers attention, memory and mood, and makes mistakes easier. In orbit it’s common: there’s noise, light and 16 sunrises a day.',
    steps: [
      ['Set your schedule', 'Go to bed and get up at the same time all week.'],
      ['Use light to your advantage', 'Bright light in the morning. Dim, warm light an hour before bed, and screens off 45 minutes before.'],
      ['Caffeine only in the morning', 'The last one at least 6 hours before bed.'],
      ['Prepare your crew quarters', 'Eye mask, earplugs, a well-secured sleeping bag and the fan on.'],
      ['15-minute routine', 'Stretch, breathe slowly and play calm music before sleeping.'],
      ['Short nap if you need it', '20 minutes at most and before 3:00 PM.'],
      ['If you’ve had three bad nights', 'Talk to the Medical Officer: they can adjust your schedule or consider other help.'],
    ],
    urgent: ['You slept less than 5 hours and have a critical task tomorrow: tell the Commander.', 'You fall asleep unintentionally during work.', 'You’ve been sleeping badly for more than a week.'],
    avoid: ['Compensating with lots of caffeine.', 'Working inside your crew quarters.', 'Taking sleeping pills without talking to the Medical Officer.'],
    helper: ['Offer to cover a task so they can rest.', 'Lower the noise and light near their crew quarters.'] },
  ansiedad: { dom: 'mente', ic: 'wind', title: 'Anxiety or panic attack', when: 'Fast heart rate and breathing without exertion, intense fear, trembling or a feeling of suffocation.',
    what: 'It’s a rush of adrenaline. It feels very intense, but it passes in a few minutes and won’t harm you. Your body prepared for a danger that isn’t there.',
    steps: [
      ['Say it quietly', '“This is anxiety. It will pass in a few minutes.”'],
      ['Breathe with me', 'Inhale for 4 seconds, hold for 4 and exhale for 6. Repeat for two minutes.'],
      ['Come back to the present', 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell and 1 you taste.'],
      ['Hold onto something firm', 'Grab a handrail and feel the pressure in your hands and feet.'],
      ['Find someone', 'Say: “I need a minute with you.” No need to explain more.'],
      ['When it eases', 'Drink water and note in the Log what happened just before.'],
    ],
    urgent: ['It doesn’t ease after 20 minutes.', 'There’s chest pain, fainting or low oxygen: treat it as a physical emergency.', 'Thoughts of harming yourself appear. Tell the Medical Officer or the Commander right away: asking for help is part of the training.'],
    avoid: ['Isolating yourself so no one notices.', 'Having caffeine.', 'Fighting the feeling: let it pass like a wave.'],
    helper: ['Speak slowly and in short sentences. Don’t say “calm down.”', 'Breathe slowly next to them so they follow your rhythm.', 'Stay until it passes and ask what they need.'], tool: 'respirar' },
  animo: { dom: 'mente', ic: 'smile', title: 'Low mood for several days', when: 'Sadness, apathy or irritability lasting more than three days.',
    what: 'On long missions it’s common, especially after the halfway point, when the novelty has worn off and the return is still far away. It’s not weakness: it’s a normal reaction to isolation.',
    steps: [
      ['Name it', 'Write in the Log how you feel. Naming it already helps.'],
      ['One pleasant thing a day', 'Small and doable: a song, a drawing, looking at Earth. Start with 5 minutes.'],
      ['Talk to someone', 'Pick a crewmate and tell them how you’re doing. They don’t have to fix anything.'],
      ['Get in touch with home', 'Schedule a video call or record a message this week.'],
      ['Take care of the basics', 'Sleep, exercise and bright light in the morning support your mood.'],
      ['Request your private conference', 'The mission psychologist can move up the session. It’s confidential.'],
    ],
    urgent: ['You’ve felt this way for more than two weeks.', 'You feel that nothing matters or that you’re a burden.', 'Thoughts of harming yourself appear. Tell the Medical Officer or the Commander right away: you don’t have to go through this alone.'],
    avoid: ['Isolating yourself in your crew quarters.', 'Burying yourself in work so you don’t think.', 'Comparing yourself to how others are doing.'],
    helper: ['Invite without pressuring: “Want to eat together?”', 'Listen more than you advise.', 'If you’re worried about their safety, talk to the Medical Officer.'] },
  conflicto: { dom: 'mente', ic: 'chat', title: 'Tension with a crewmate', when: 'Friction, arguments or awkward silences that keep happening.',
    what: 'Living for months in a small space with the same people wears anyone down. Friction is normal. What matters is addressing it early.',
    steps: [
      ['Take a pause', 'Step away for 10 minutes and breathe before responding.'],
      ['Organize your thoughts', 'Write in the Log what happened and what you need.'],
      ['Talk privately and soon', 'Use “I” statements: “When this happens, I feel this way and I need this.”'],
      ['Listen to their side', 'Without interrupting. Repeat what you understood before answering.'],
      ['Agree on a small change', 'A concrete one you can try this week.'],
      ['If it doesn’t improve', 'Talk to the Commander or the mission psychologist in your private conference.'],
    ],
    urgent: ['There’s shouting, threats or shoving.', 'The tension affects a safety task.', 'Someone stops talking to everyone else for days.'],
    avoid: ['Venting to others behind their back.', 'Arguing in front of everyone or in the middle of a critical task.', 'Keeping it in until you explode.'],
    helper: ['Don’t take sides. Help them talk to each other.', 'If you’re the Commander, call a brief, neutral conversation.'] },
};

/* ===== Mood activities ===== */
const CATS = { crear: 'Create', conectar: 'Connect', calma: 'Calm', mover: 'Move', sentido: 'Purpose', jugar: 'Play' };
const ACTS = [
  { id: 'flor', cat: 'crear', min: 5, t: 'Draw a flower', d: 'Grab paper and pencil, or open the sketchpad, and draw a flower you like from Earth. It doesn’t have to look pretty.', tool: 'dibujo', prompt: 'a flower', tags: ['dibujo', 'plantas'] },
  { id: 'pelicula', cat: 'conectar', min: 10, t: 'Talk about your favorite movie', d: 'Find a crewmate and tell them your favorite movie and why. Then ask about theirs.', tags: ['cine'] },
  { id: 'caja', cat: 'calma', min: 2, t: 'Box breathing', d: 'Inhale for 4 seconds, hold for 4, exhale for 4 and wait 4. Repeat for two minutes.', tool: 'respirar' },
  { id: 'tresbuenas', cat: 'sentido', min: 5, t: 'Three good things', d: 'Write three good things from today in the Log, even small ones: a hot coffee, a view, a joke.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'mensaje', cat: 'conectar', min: 10, t: 'A message home', d: 'Record or write a short message for someone you love. It will go out in the next communication window.', tags: ['escritura'] },
  { id: 'tierra', cat: 'calma', min: 5, t: 'Watch Earth for five minutes', d: 'Go to the window and look for your city, a place you’d like to visit, or just follow the clouds.', tags: ['fotografía'] },
  { id: 'foto', cat: 'crear', min: 5, t: 'Photo of the day', d: 'Take a photo of something you find beautiful today, inside or outside the spacecraft, and give it a title.', tags: ['fotografía'] },
  { id: 'estirar', cat: 'mover', min: 3, t: 'Stretch your neck and back', d: 'Hold onto a handrail and stretch your neck, shoulders and back for three minutes, no rush.', tags: ['ejercicio'] },
  { id: 'reto', cat: 'jugar', min: 5, t: 'Aim challenge', d: 'Challenge a crewmate: who can land a paper ball in a bag from farther away?' },
  { id: 'comida', cat: 'conectar', min: 20, t: 'Screen-free meal', d: 'Share your next meal with at least one crewmate, with no screens and no work talk.', tags: ['cocina'] },
  { id: 'haiku', cat: 'crear', min: 5, t: 'A space haiku', d: 'Write three short lines about something you saw today and save them in the Log.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'cancion', cat: 'calma', min: 4, t: 'Your favorite song', d: 'Put on your headphones, close your eyes and listen to a whole song without doing anything else.', tags: ['música'] },
  { id: 'carta', cat: 'sentido', min: 5, t: 'Note for your return', d: 'Write two lines to read the day you return to Earth.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'palabra', cat: 'conectar', min: 5, t: 'Teach a word', d: 'Teach a crewmate a word or saying from your homeland and learn one of theirs.' },
  { id: 'baile', cat: 'mover', min: 3, t: 'Dance to a song', d: 'Play a song that lifts you up and move however you can. If someone joins in, even better.', tags: ['música', 'ejercicio'] },
  { id: 'escaneo', cat: 'calma', min: 3, t: 'Body scan', d: 'Close your eyes and relax each part of your body, from feet to head, letting your breath out slowly.' },
  { id: 'vista', cat: 'crear', min: 8, t: 'Draw your favorite view', d: 'Draw from memory the view of Earth you’ve liked most on this mission.', tool: 'dibujo', prompt: 'your favorite view of Earth', tags: ['dibujo'] },
  { id: 'gracias', cat: 'conectar', min: 2, t: 'Say thank you', d: 'Tell a crewmate one specific thing you’re grateful for this week.' },
  { id: 'partida', cat: 'jugar', min: 10, t: 'Quick game', d: 'Ten minutes of chess, cards or riddles with whoever is free.', tags: ['ajedrez'] },
  { id: 'plantas', cat: 'sentido', min: 5, t: 'Visit the garden', d: 'Stop by the plant module: see how much they’ve grown, touch a leaf, smell the damp soil.', tags: ['plantas'] },
  { id: 'lista', cat: 'crear', min: 5, t: 'A song for the crew', d: 'Add a song to the mission playlist and tell us why you chose it.', tags: ['música'] },
  { id: 'diez', cat: 'calma', min: 1, t: 'Ten slow breaths', d: 'Before your next task, take ten slow breaths, counting each one.', tool: 'respirar' },
  { id: 'plan', cat: 'sentido', min: 5, t: 'Your first plan on Earth', d: 'Think about what you’ll eat and who you’ll see first when you get back. Tell someone or write it down.', tags: ['cocina', 'escritura'] },
  { id: 'pregunta', cat: 'conectar', min: 5, t: 'Question of the day', d: 'Ask a crewmate: what smell from Earth do you miss most?' },
  { id: 'agua', cat: 'mover', min: 2, t: 'Water and a break', d: 'Drink water and look away from the screens for two minutes.' },
  { id: 'caricatura', cat: 'crear', min: 8, t: 'Crew caricature', d: 'Draw your crewmates as comic characters and show them the result.', tool: 'dibujo', prompt: 'your crewmates', tags: ['dibujo'] },
  { id: 'desconexion', cat: 'calma', min: 15, t: 'Bedtime routine', d: 'Dim the lights, put the screens away and calmly get your crew quarters ready before going to bed.', noche: true },
  { id: 'porque', cat: 'sentido', min: 3, t: 'Remember why you came', d: 'Write a sentence about what this mission means to you.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'tararea', cat: 'jugar', min: 5, t: 'Guess the song', d: 'Hum a song and have a crewmate guess it. Then switch.', tags: ['música'] },
  { id: 'llamada', cat: 'conectar', min: 5, t: 'Prepare your call home', d: 'Check when your next video call is and think of one good thing you want to share.' },
  { id: 'lectura', cat: 'calma', min: 10, t: 'Ten minutes of reading', d: 'Read something that isn’t a procedure: a novel, a short story, a poem.', tags: ['lectura'] },
  { id: 'estrella', cat: 'sentido', min: 5, t: 'Find a star', d: 'From the window, pick a star or a constellation and learn its name.', tags: ['fotografía'] },
];
const actById = (id) => ACTS.find((x) => x.id === id);

/* ===== Log ===== */
const TAGS = ['Symptom', 'Sleep', 'Mood', 'Work', 'Living together', 'Family', 'Achievement'];
const SYMS = ['Headache', 'Nausea', 'Congestion', 'Back pain', 'Dizziness', 'Tiredness', 'Irritated eyes'];
