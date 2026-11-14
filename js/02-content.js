/* ===== Misión y tripulación de ejemplo ===== */
const MISSION = { name: 'Expedición Aurora', day: 127, total: 180 };
const CREW = [
  { id: 'amara', name: 'Amara Okafor', short: 'Amara', role: 'Ingeniera de vuelo', ini: 'AO', story: 'infeccion', need: 7.5, exAt: 960,
    base: { temp: 36.6, hr: 58, rr: 14, spo2: 98, sleep: 7.5, mood: 4.0, stress: 2.0 }, likes: ['dibujo', 'música', 'plantas'] },
  { id: 'kenji', name: 'Kenji Mori', short: 'Kenji', role: 'Oficial médico', ini: 'KM', story: 'sueno', need: 7.5, exAt: 510,
    base: { temp: 36.4, hr: 62, rr: 13, spo2: 97.4, sleep: 7.2, mood: 3.8, stress: 2.4 }, likes: ['lectura', 'ajedrez', 'fotografía'] },
  { id: 'valentina', name: 'Valentina Reyes', short: 'Valentina', role: 'Comandante', ini: 'VR', story: 'estable', need: 7.5, exAt: 1050,
    base: { temp: 36.7, hr: 55, rr: 12, spo2: 98, sleep: 7.7, mood: 4.2, stress: 2.2 }, likes: ['música', 'cocina', 'ejercicio'] },
  { id: 'lucas', name: 'Lucas Ferreira', short: 'Lucas', role: 'Especialista científico', ini: 'LF', story: 'animo', need: 8, exAt: 660,
    base: { temp: 36.5, hr: 64, rr: 15, spo2: 97.6, sleep: 7.5, mood: 3.9, stress: 2.3 }, likes: ['cine', 'escritura', 'fotografía'] },
];
const crewById = (id) => CREW.find((c) => c.id === id);

/* Historia simulada de cada tripulante: desvíos por día (0 = hoy, 1 = ayer…) */
const pick = (arr, o) => (o < arr.length ? arr[o] : 0);
const STORY = {
  estable: () => ({}),
  infeccion: (o) => ({ temp: pick([0.55, 0.42, 0.28, 0.12], o), hr: pick([8, 6, 4, 2], o), rr: pick([1.4, 1, 0.5], o), sleep: pick([-0.8, -0.5], o), mood: pick([-0.5, -0.3], o), eff: pick([-0.05, -0.03], o) }),
  sueno: (o) => ({ sleep: pick([-2.1, -1.8, -2.0, -1.5, -1.7, -1.1, -0.6], o), eff: o <= 6 ? -0.06 : 0, mood: pick([-0.5, -0.4, -0.3, -0.2], o), stress: pick([0.6, 0.5, 0.4, 0.3, 0.2], o), hr: pick([4, 3, 3, 2, 2], o) }),
  animo: (o) => ({ mood: pick([-1.9, -1.9, -1.8, -1.6, -1.4, -1.1, -0.8, -0.5, -0.2], o), stress: o <= 5 ? 0.5 : 0, sleep: o <= 4 ? -0.5 : 0, eff: o <= 4 ? -0.04 : 0, ex: o <= 4 ? -0.4 : 0 }),
};

/* ===== Niveles ===== */
const LV = { ok: 0, watch: 1, alert: 2, emergency: 3 };
const LVN = ['ok', 'watch', 'alert', 'emergency'];
const LEVELS = {
  ok: { label: 'Estable', ic: 'check' },
  watch: { label: 'Atención', ic: 'eye' },
  alert: { label: 'Alerta', ic: 'alert' },
  emergency: { label: 'Emergencia', ic: 'octagon' },
};
const maxLv = (arr) => LVN[arr.reduce((m, x) => Math.max(m, LV[x.level] || 0), 0)];

/* ===== Ánimo ===== */
const MOODS = [
  { v: 1, label: 'Muy mal', mouth: 'M8.2 16.6q3.8-3.6 7.6 0', brow: 'M7.6 8.2l2.6 1M16.4 8.2l-2.6 1' },
  { v: 2, label: 'Mal', mouth: 'M8.4 16q3.6-2.2 7.2 0' },
  { v: 3, label: 'Regular', mouth: 'M8.6 15.4h6.8' },
  { v: 4, label: 'Bien', mouth: 'M8.4 14.6q3.6 2.6 7.2 0' },
  { v: 5, label: 'Muy bien', mouth: 'M7.8 13.8q4.2 4.8 8.4 0' },
];
const TENSION = ['Nada', 'Poca', 'Algo', 'Bastante', 'Mucha'];
const faceSvg = (v, cls = '') => { const m = MOODS[clamp(Math.round(v), 1, 5) - 1]; return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9 10h.01M15 10h.01" stroke-width="2.6"/><path d="${m.mouth}"/>${m.brow ? `<path d="${m.brow}"/>` : ''}</svg>`; };
const moodLabel = (v) => MOODS[clamp(Math.round(v), 1, 5) - 1].label;

/* ===== Condiciones que detecta el motor ===== */
const cnd = (dom, guide, n, u, dec, s) => ({ dom, guide, n, u, dec, s });
const COND = {
  fiebre_alta: cnd('cuerpo', 'fiebre', 'fiebre alta', '°C', 1, 'Tu temperatura está muy por encima de lo seguro. Sigue la guía ahora.'),
  fiebre: cnd('cuerpo', 'fiebre', 'fiebre', '°C', 1, 'Tu temperatura pasó de 38 °C. Deja lo que estás haciendo y sigue la guía.'),
  febricula: cnd('cuerpo', 'fiebre', 'temperatura algo elevada', '°C', 1, 'Todavía no es fiebre. Descansa, bebe agua y vuelve a medir en un rato.'),
  temp_desv: cnd('cuerpo', 'fiebre', 'temperatura sobre tu rango habitual', '°C', 1, 'Es un valor normal para la mayoría, pero alto para ti.'),
  hipotermia: cnd('cuerpo', 'frio', 'temperatura muy baja', '°C', 1, 'Tu cuerpo está perdiendo demasiado calor. Sigue la guía ahora.'),
  temp_baja: cnd('cuerpo', 'frio', 'temperatura baja', '°C', 1, 'Repite la medición con tu termómetro y abrígate.'),
  taqui_grave: cnd('cuerpo', 'taquicardia', 'pulso muy acelerado en reposo', 'lpm', 0, 'Tu corazón late muy rápido sin esfuerzo. Detente y sigue la guía ahora.'),
  taqui: cnd('cuerpo', 'taquicardia', 'pulso acelerado en reposo', 'lpm', 0, 'Tu corazón late rápido sin que te estés moviendo. Detente y respira despacio.'),
  hr_alta: cnd('cuerpo', 'taquicardia', 'pulso algo elevado en reposo', 'lpm', 0, 'Haz una pausa, bebe agua y vuelve a medir.'),
  hr_desv: cnd('cuerpo', 'taquicardia', 'pulso sobre tu rango habitual', 'lpm', 0, 'Es un valor normal en general, pero alto para ti.'),
  bradi_grave: cnd('cuerpo', 'bradicardia', 'pulso muy lento', 'lpm', 0, 'Tu corazón late muy despacio. Sigue la guía ahora.'),
  bradi: cnd('cuerpo', 'bradicardia', 'pulso lento', 'lpm', 0, 'Si te sientes mareado o débil, avisa.'),
  taquipnea_grave: cnd('cuerpo', 'respiracion', 'respiración muy acelerada', 'rpm', 0, 'Respiras demasiado rápido en reposo. Sigue la guía ahora.'),
  taquipnea: cnd('cuerpo', 'respiracion', 'respiración acelerada', 'rpm', 0, 'Respiras rápido sin esfuerzo. Ponte erguido y exhala despacio.'),
  rr_alta: cnd('cuerpo', 'respiracion', 'respiración algo rápida', 'rpm', 0, 'Haz una pausa y respira despacio.'),
  rr_desv: cnd('cuerpo', 'respiracion', 'respiración sobre tu rango habitual', 'rpm', 0, 'Es un valor normal en general, pero alto para ti.'),
  bradipnea_grave: cnd('cuerpo', 'respiracion_lenta', 'respiración muy lenta', 'rpm', 0, 'Respiras demasiado despacio. Sigue la guía ahora.'),
  bradipnea: cnd('cuerpo', 'respiracion_lenta', 'respiración lenta', 'rpm', 0, 'Respira hondo varias veces y repite la medición.'),
  hipoxia_grave: cnd('cuerpo', 'oxigeno', 'oxígeno muy bajo', '%', 0, 'Tu sangre lleva muy poco oxígeno. Sigue la guía ahora.'),
  hipoxia: cnd('cuerpo', 'oxigeno', 'oxígeno bajo', '%', 0, 'Tu saturación bajó de 91 %. Detén el esfuerzo y sigue la guía.'),
  spo2_baja: cnd('cuerpo', 'oxigeno', 'oxígeno algo bajo', '%', 0, 'Revisa cómo mediste, respira hondo y vuelve a medir.'),
  spo2_desv: cnd('cuerpo', 'oxigeno', 'oxígeno por debajo de tu rango habitual', '%', 0, 'Es un valor aceptable en general, pero bajo para ti.'),
  ansiedad: cnd('mente', 'ansiedad', 'señales de ansiedad aguda', '', 0, 'Tu pulso y tu respiración se aceleraron sin esfuerzo ni fiebre. Puede ser ansiedad o estrés intenso: respira conmigo.'),
};
const condVal = (code, v) => { const c = COND[code]; return c.u ? `${fx(v, c.dec)} ${c.u}` : ''; };
const condTitle = (code, v) => { const c = COND[code]; return c.u ? `${cap(c.n)}: ${condVal(code, v)}` : cap(c.n); };
const condInline = (code, v) => { const c = COND[code]; return c.u ? `${c.n} (${condVal(code, v)})` : c.n; };

/* ===== Guías de emergencia ===== */
const GUIDES = {
  fiebre: { dom: 'cuerpo', ic: 'thermo', title: 'Fiebre o temperatura alta', when: 'Temperatura de 38 °C o más. Atención desde 37.5 °C.',
    what: 'Tu cuerpo está más caliente de lo normal. Casi siempre es su forma de defenderse de una infección.',
    steps: [
      ['Para y descansa', 'Deja la tarea, ve a tu camarote o a una zona ventilada y di que te retiras.'],
      ['Confirma la medición', 'Revisa que tu instrumento esté bien colocado, mide de nuevo a los 5 minutos y anota el nuevo valor.'],
      ['Bebe agua', 'Un vaso (250 ml) cada hora. Con fiebre te deshidratas más rápido.'],
      ['Refréscate sin frío extremo', 'Quítate capas de ropa y ponte un paño húmedo y tibio en la frente y el cuello.'],
      ['Habla con el oficial médico', 'Te dirá si conviene tomar el antitérmico del botiquín y cada cuánto.'],
      ['Cuida a los demás', 'En una nave cerrada los contagios son rápidos: usa mascarilla y limpia lo que toques.'],
      ['Anota tus síntomas', 'Tos, dolor, escalofríos, náusea. Escríbelos en la bitácora con la hora.'],
    ],
    urgent: ['La temperatura llega a 39.5 °C o sube muy rápido.', 'Te cuesta respirar, estás confundido o muy somnoliento.', 'Tienes el cuello rígido, manchas en la piel o un dolor intenso.', 'La fiebre sigue después de 24 horas.'],
    avoid: ['Hacer ejercicio o seguir con trabajo físico.', 'Usar paños helados o abrigarte de más.', 'Tomar medicamentos sin que lo sepa el oficial médico.'],
    helper: ['Acompaña a la persona a su camarote y llévale agua.', 'Mide su temperatura cada 30 minutos y anótala.', 'Informa a control de misión en la próxima ventana de comunicación.'] },
  frio: { dom: 'cuerpo', ic: 'thermo', title: 'Temperatura corporal baja', when: 'Temperatura por debajo de 35.5 °C.',
    what: 'Tu cuerpo pierde calor más rápido de lo que lo produce. A veces es solo una medición mal hecha o una zona fría de la nave.',
    steps: [
      ['Repite la medición', 'Coloca bien el termómetro y espera 3 minutos antes de volver a medir.'],
      ['Abrígate', 'Ropa seca, gorro y la manta térmica del botiquín.'],
      ['Toma algo caliente y dulce', 'Solo si estás bien despierto y puedes tragar sin problema.'],
      ['Muévete suave', 'Mueve brazos y piernas sin llegar a sudar.'],
      ['Mira la temperatura del módulo', 'Si el ambiente está frío, cambia de zona y avisa para que lo revisen.'],
      ['Vuelve a medir', 'A los 15 minutos, comprueba que la temperatura sube.'],
    ],
    urgent: ['La temperatura baja de 35 °C.', 'El temblor no para, o desaparece de golpe mientras sigues con frío.', 'Hablas lento, te sientes torpe o confundido.', 'Tienes muchísimo sueño.'],
    avoid: ['Aplicar calor directo o agua muy caliente sobre la piel.', 'Quedarte quieto y solo.'],
    helper: ['Cubre a la persona con mantas, también la cabeza.', 'No la dejes sola y háblale para ver cómo responde.', 'Avisa al oficial médico.'] },
  taquicardia: { dom: 'cuerpo', ic: 'heart', title: 'Pulso acelerado en reposo', when: 'Más de 100 latidos por minuto sin esfuerzo. Alerta desde 120.',
    what: 'Tu corazón late más rápido de lo normal sin que te estés moviendo. Puede deberse a fiebre, falta de líquidos, cafeína, dolor, poco sueño o estrés.',
    steps: [
      ['Detente y sujétate', 'Ánclate en un lugar cómodo y afloja la ropa ajustada.'],
      ['Respira despacio dos minutos', 'Inhala 4 segundos por la nariz y exhala 6 por la boca.'],
      ['Repasa posibles causas', '¿Tomaste cafeína? ¿Tienes fiebre? ¿Has bebido poco? ¿Te asustaste o estás muy tenso?'],
      ['Bebe agua', 'Un vaso despacio.'],
      ['Vuelve a medir a los 5 minutos', 'Lo normal es que el pulso empiece a bajar.'],
      ['Si sigue sobre 120 tras 10 minutos', 'Avisa al oficial médico aunque te sientas bien.'],
    ],
    urgent: ['Dolor u opresión en el pecho.', 'Falta de aire.', 'Mareo fuerte, desmayo o visión borrosa.', 'Latidos irregulares o pulso de 140 o más en reposo.'],
    avoid: ['Tomar más cafeína o bebidas energéticas.', 'Seguir trabajando para ver si se pasa.', 'Quedarte solo si te sientes mareado.'],
    helper: ['Quédate con la persona y tómale el pulso en la muñeca.', 'Ten a mano el botiquín y el desfibrilador (DEA).', 'Si pierde el conocimiento y no respira: reanimación (RCP) como en el entrenamiento y pide el DEA.'], tool: 'respirar' },
  bradicardia: { dom: 'cuerpo', ic: 'heart', title: 'Pulso muy lento', when: 'Menos de 42 latidos por minuto estando despierto.',
    what: 'Tu corazón late más despacio de lo habitual. En personas muy entrenadas puede ser normal, sobre todo en reposo. Importa cuando viene con mareo o debilidad.',
    steps: [
      ['Fíjate en cómo te sientes', 'Si estás bien y sin mareo, puede ser normal en ti.'],
      ['Actívate un minuto', 'Mueve brazos y piernas y mira si el pulso sube.'],
      ['Repite la medición', 'Cuenta el pulso un minuto completo, quieto y sentado.'],
      ['Piensa en los medicamentos', 'Anota si tomaste algo para dormir, para el dolor o para la presión.'],
      ['Si notas síntomas, avisa', 'Mareo, debilidad o falta de aire: llama al oficial médico.'],
    ],
    urgent: ['Mareo, debilidad o desmayo.', 'Dolor en el pecho o falta de aire.', 'Confusión.', 'Pulso por debajo de 35 latidos por minuto.'],
    avoid: ['Ignorarlo si te sientes débil.', 'Hacer tareas de riesgo sin compañía.'],
    helper: ['Quédate con la persona y vigila que responda.', 'Ten a mano el desfibrilador (DEA).', 'Si no responde y no respira: RCP como en el entrenamiento.'] },
  respiracion: { dom: 'cuerpo', ic: 'wind', title: 'Respiración acelerada', when: 'Más de 20 respiraciones por minuto en reposo. Alerta desde 24.',
    what: 'Respiras más rápido de lo normal. Puede ser por un esfuerzo reciente, fiebre, ansiedad o porque el aire de la cabina tiene demasiado CO₂.',
    steps: [
      ['Ponte erguido', 'Espalda recta, hombros sueltos y el pecho abierto.'],
      ['Respira con los labios fruncidos', 'Inhala 2 segundos por la nariz y exhala 4 por la boca, como si soplaras una vela. Dos minutos.'],
      ['Mira tu oxígeno en sangre', 'Si está por debajo de 94 %, abre también la guía de oxígeno bajo.'],
      ['Revisa el aire de la cabina', 'Mira el CO₂ en el panel ambiental. Si está alto o varios tienen dolor de cabeza, cambien de módulo y avisen.'],
      ['Busca la causa', 'Si tienes fiebre o estás muy nervioso, sigue esa guía.'],
      ['Vuelve a medir a los 5 minutos', 'Tu respiración debería ir bajando.'],
    ],
    urgent: ['30 respiraciones por minuto o más en reposo.', 'Labios o uñas azulados.', 'No puedes decir una frase completa sin parar a respirar.', 'Dolor en el pecho al respirar.'],
    avoid: ['Respirar dentro de una bolsa.', 'Encogerte: mantén el pecho abierto.', 'Quedarte solo.'],
    helper: ['Respira despacio a su lado para que siga tu ritmo.', 'Comprueba su oxígeno y el aire del módulo.', 'Prepara el oxígeno portátil por si el oficial médico lo indica.'], tool: 'respirar' },
  respiracion_lenta: { dom: 'cuerpo', ic: 'wind', title: 'Respiración muy lenta', when: 'Menos de 10 respiraciones por minuto.',
    what: 'Respiras muy despacio. Puede pasar en sueño profundo, con medicamentos para dormir o para el dolor, o si se acumula CO₂ alrededor de tu cara.',
    steps: [
      ['Respira hondo cinco veces', 'Luego muévete un poco para activarte.'],
      ['Repite la medición', 'Cuenta el pulso un minuto completo, quieto y sentado.'],
      ['Mira tu oxígeno en sangre', 'Si baja de 94 %, abre la guía de oxígeno bajo.'],
      ['Revisa la ventilación', 'Sin corriente de aire, el CO₂ que exhalas se queda alrededor de tu cabeza. Comprueba que el ventilador del camarote funciona.'],
      ['Piensa en los medicamentos', 'Si tomaste algo para dormir o para el dolor, díselo al oficial médico.'],
    ],
    urgent: ['Menos de 8 respiraciones por minuto.', 'La persona no despierta o responde muy poco.', 'Oxígeno por debajo de 90 %.', 'Pausas largas entre una respiración y otra.'],
    avoid: ['Volver a dormir sin revisar la ventilación.', 'Tomar otra dosis de un medicamento para dormir.'],
    helper: ['Háblale fuerte y tócale el hombro para despertarla.', 'Si no responde: abre la vía aérea, comprueba si respira y pide ayuda.', 'Prepara oxígeno y sigue el entrenamiento de primeros auxilios.'] },
  oxigeno: { dom: 'cuerpo', ic: 'drop', title: 'Oxígeno bajo en sangre', when: 'Saturación de 90 % o menos. Atención desde 94 %.',
    what: 'Tu sangre lleva menos oxígeno del que necesita. Puede ser un problema de respiración, del aire de la cabina o solo una mala lectura del oxímetro.',
    steps: [
      ['Detén todo esfuerzo', 'Quédate quieto, erguido y con el pecho abierto.'],
      ['Repite la medición', 'Los dedos fríos o un oxímetro mal puesto dan lecturas bajas. Colócalo bien, espera un minuto y vuelve a medir.'],
      ['Respira lento y profundo', 'Inhala por la nariz y exhala despacio con los labios fruncidos.'],
      ['Revisa el aire de la cabina', 'Mira el O₂ y el CO₂ en el panel ambiental. Si hay alarma de atmósfera, sigue ese procedimiento y usa la mascarilla de oxígeno portátil.'],
      ['Avisa si no mejora', 'Si sigues por debajo de 90 % después de 3 minutos, llama a la tripulación. El oficial médico puede indicar oxígeno suplementario.'],
    ],
    urgent: ['Saturación de 85 % o menos.', 'Labios o uñas azulados.', 'Confusión, mucho sueño o mareo.', 'Falta de aire intensa o que va a más.'],
    avoid: ['Seguir trabajando o hacer ejercicio.', 'Quedarte solo en un módulo cerrado.', 'Fiarte de una sola lectura: vuelve a medir.'],
    helper: ['Lleva el oxígeno portátil y quédate con la persona.', 'Comprueba el aire del módulo antes de entrar.', 'Informa a control de misión.'], tool: 'respirar' },
  sueno: { dom: 'cuerpo', ic: 'moon', title: 'Falta de sueño', when: 'Menos de 6 horas por noche varias noches, o sueño muy interrumpido.',
    what: 'Dormir poco varios días baja la atención, la memoria y el ánimo, y hace más fáciles los errores. En órbita es frecuente: hay ruido, luz y 16 amaneceres al día.',
    steps: [
      ['Fija tu horario', 'Acuéstate y levántate a la misma hora toda la semana.'],
      ['Usa la luz a tu favor', 'Luz intensa por la mañana. Luz tenue y cálida una hora antes de dormir, y pantallas apagadas 45 minutos antes.'],
      ['Cafeína solo por la mañana', 'La última, al menos 6 horas antes de acostarte.'],
      ['Prepara tu camarote', 'Antifaz, tapones, saco bien sujeto y ventilador encendido.'],
      ['Rutina de 15 minutos', 'Estira, respira despacio y pon música tranquila antes de dormir.'],
      ['Siesta corta si la necesitas', '20 minutos como máximo y antes de las 15:00.'],
      ['Si llevas tres noches mal', 'Habla con el oficial médico: puede ajustar tu agenda o valorar otra ayuda.'],
    ],
    urgent: ['Dormiste menos de 5 horas y mañana tienes una tarea crítica: avisa al comandante.', 'Te quedas dormido sin querer durante el trabajo.', 'Llevas más de una semana durmiendo mal.'],
    avoid: ['Compensar con mucha cafeína.', 'Trabajar dentro del camarote.', 'Tomar pastillas para dormir sin hablar con el oficial médico.'],
    helper: ['Ofrécete a cubrir una tarea para que pueda descansar.', 'Baja el ruido y la luz cerca de su camarote.'] },
  ansiedad: { dom: 'mente', ic: 'wind', title: 'Ansiedad o crisis de pánico', when: 'Pulso y respiración acelerados sin esfuerzo, miedo intenso, temblor o sensación de ahogo.',
    what: 'Es una descarga de adrenalina. Se siente muy fuerte, pero pasa en unos minutos y no te hace daño. Tu cuerpo se preparó para un peligro que no está ahí.',
    steps: [
      ['Dilo en voz baja', '«Esto es ansiedad. Va a pasar en unos minutos.»'],
      ['Respira conmigo', 'Inhala 4 segundos, sostén 4 y exhala 6. Repite durante dos minutos.'],
      ['Vuelve al presente', 'Nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles y 1 que saboreas.'],
      ['Sujétate a algo firme', 'Agarra un pasamanos y siente la presión en las manos y en los pies.'],
      ['Busca a alguien', 'Di: «Necesito un minuto contigo». No hace falta explicar más.'],
      ['Cuando baje', 'Toma agua y anota en la bitácora qué pasó justo antes.'],
    ],
    urgent: ['No baja después de 20 minutos.', 'Hay dolor en el pecho, desmayo u oxígeno bajo: trátalo como una emergencia física.', 'Aparecen ideas de hacerte daño. Avisa de inmediato al oficial médico o al comandante: pedir ayuda es parte del entrenamiento.'],
    avoid: ['Aislarte para que nadie lo note.', 'Tomar cafeína.', 'Pelearte con la sensación: déjala pasar como una ola.'],
    helper: ['Habla despacio y con frases cortas. No digas «cálmate».', 'Respira lento a su lado para que siga tu ritmo.', 'Quédate hasta que pase y pregunta qué necesita.'], tool: 'respirar' },
  animo: { dom: 'mente', ic: 'smile', title: 'Ánimo bajo varios días', when: 'Tristeza, apatía o irritabilidad que duran más de tres días.',
    what: 'En misiones largas es común, sobre todo después de la mitad, cuando la novedad pasó y el regreso aún está lejos. No es debilidad: es una reacción normal al aislamiento.',
    steps: [
      ['Ponle nombre', 'Escribe en la bitácora cómo te sientes. Nombrarlo ya ayuda.'],
      ['Una cosa agradable al día', 'Pequeña y posible: una canción, un dibujo, mirar la Tierra. Empieza con 5 minutos.'],
      ['Habla con alguien', 'Elige a un compañero y cuéntale cómo estás. No tiene que arreglar nada.'],
      ['Contacta con casa', 'Agenda una videollamada o graba un mensaje esta semana.'],
      ['Cuida lo básico', 'Sueño, ejercicio y luz intensa por la mañana sostienen el ánimo.'],
      ['Pide tu conferencia privada', 'El psicólogo de misión puede adelantar la sesión. Es confidencial.'],
    ],
    urgent: ['Llevas más de dos semanas así.', 'Sientes que nada tiene sentido o que eres una carga.', 'Aparecen ideas de hacerte daño. Avisa de inmediato al oficial médico o al comandante: no tienes que pasar por esto solo.'],
    avoid: ['Aislarte en tu camarote.', 'Llenarte de trabajo para no pensar.', 'Compararte con cómo están los demás.'],
    helper: ['Invita sin presionar: «¿Comemos juntos?».', 'Escucha más de lo que aconsejas.', 'Si te preocupa su seguridad, habla con el oficial médico.'] },
  conflicto: { dom: 'mente', ic: 'chat', title: 'Tensión con un compañero', when: 'Roces, discusiones o silencios incómodos que se repiten.',
    what: 'Vivir meses en un espacio pequeño con las mismas personas desgasta a cualquiera. Los roces son normales. Lo importante es atenderlos pronto.',
    steps: [
      ['Haz una pausa', 'Aléjate 10 minutos y respira antes de responder.'],
      ['Ordena tus ideas', 'Escribe en la bitácora qué pasó y qué necesitas.'],
      ['Habla en privado y pronto', 'Usa frases en primera persona: «Cuando pasa esto, me siento así y necesito esto».'],
      ['Escucha su versión', 'Sin interrumpir. Repite lo que entendiste antes de contestar.'],
      ['Acuerden un cambio pequeño', 'Uno concreto que puedan probar esta semana.'],
      ['Si no mejora', 'Habla con el comandante o con el psicólogo de misión en tu conferencia privada.'],
    ],
    urgent: ['Hay gritos, amenazas o empujones.', 'La tensión afecta una tarea de seguridad.', 'Alguien deja de hablar con el resto durante días.'],
    avoid: ['Desahogarte con otros a sus espaldas.', 'Discutir delante de todos o en medio de una tarea crítica.', 'Guardártelo hasta explotar.'],
    helper: ['No tomes partido. Ayuda a que hablen entre ellos.', 'Si eres comandante, convoca una conversación breve y neutral.'] },
};

/* ===== Actividades para el ánimo ===== */
const CATS = { crear: 'Crear', conectar: 'Conectar', calma: 'Calma', mover: 'Moverte', sentido: 'Sentido', jugar: 'Jugar' };
const ACTS = [
  { id: 'flor', cat: 'crear', min: 5, t: 'Dibuja una flor', d: 'Toma papel y lápiz, o abre el bloc de dibujo, y dibuja una flor que te guste de la Tierra. No tiene que quedar bonita.', tool: 'dibujo', prompt: 'una flor', tags: ['dibujo', 'plantas'] },
  { id: 'pelicula', cat: 'conectar', min: 10, t: 'Habla de tu película favorita', d: 'Busca a un compañero y cuéntale cuál es tu película favorita y por qué. Luego pregúntale la suya.', tags: ['cine'] },
  { id: 'caja', cat: 'calma', min: 2, t: 'Respira en caja', d: 'Inhala 4 segundos, sostén 4, exhala 4 y espera 4. Repite durante dos minutos.', tool: 'respirar' },
  { id: 'tresbuenas', cat: 'sentido', min: 5, t: 'Tres cosas buenas', d: 'Escribe en la bitácora tres cosas buenas de hoy, aunque sean pequeñas: un café caliente, una vista, una broma.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'mensaje', cat: 'conectar', min: 10, t: 'Un mensaje a casa', d: 'Graba o escribe un mensaje corto para alguien que quieres. Saldrá en la próxima ventana de comunicación.', tags: ['escritura'] },
  { id: 'tierra', cat: 'calma', min: 5, t: 'Mira la Tierra cinco minutos', d: 'Ve a la ventana y busca tu ciudad, un lugar que quieras visitar, o simplemente sigue las nubes.', tags: ['fotografía'] },
  { id: 'foto', cat: 'crear', min: 5, t: 'La foto del día', d: 'Toma una foto de algo que hoy te parezca bonito, dentro o fuera de la nave, y ponle título.', tags: ['fotografía'] },
  { id: 'estirar', cat: 'mover', min: 3, t: 'Estira cuello y espalda', d: 'Sujétate de un pasamanos y estira cuello, hombros y espalda durante tres minutos, sin prisa.', tags: ['ejercicio'] },
  { id: 'reto', cat: 'jugar', min: 5, t: 'Reto de puntería', d: 'Reta a un compañero: ¿quién mete una bola de papel en una bolsa desde más lejos?' },
  { id: 'comida', cat: 'conectar', min: 20, t: 'Comida sin pantallas', d: 'Comparte la próxima comida con al menos un compañero, sin pantallas ni temas de trabajo.', tags: ['cocina'] },
  { id: 'haiku', cat: 'crear', min: 5, t: 'Un haiku del espacio', d: 'Escribe tres versos cortos sobre algo que viste hoy y guárdalos en la bitácora.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'cancion', cat: 'calma', min: 4, t: 'Tu canción favorita', d: 'Ponte los auriculares, cierra los ojos y escucha una canción completa sin hacer nada más.', tags: ['música'] },
  { id: 'carta', cat: 'sentido', min: 5, t: 'Nota para tu regreso', d: 'Escribe dos líneas para leer el día que vuelvas a la Tierra.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'palabra', cat: 'conectar', min: 5, t: 'Enseña una palabra', d: 'Enséñale a un compañero una palabra o un dicho de tu tierra y aprende uno suyo.' },
  { id: 'baile', cat: 'mover', min: 3, t: 'Baila una canción', d: 'Pon una canción que te anime y muévete como puedas. Si alguien se suma, mejor.', tags: ['música', 'ejercicio'] },
  { id: 'escaneo', cat: 'calma', min: 3, t: 'Repaso del cuerpo', d: 'Cierra los ojos y relaja cada parte del cuerpo, de los pies a la cabeza, soltando el aire despacio.' },
  { id: 'vista', cat: 'crear', min: 8, t: 'Dibuja tu vista favorita', d: 'Dibuja de memoria la vista de la Tierra que más te ha gustado en esta misión.', tool: 'dibujo', prompt: 'tu vista favorita de la Tierra', tags: ['dibujo'] },
  { id: 'gracias', cat: 'conectar', min: 2, t: 'Da las gracias', d: 'Dile a un compañero una cosa concreta que agradeces de esta semana.' },
  { id: 'partida', cat: 'jugar', min: 10, t: 'Partida rápida', d: 'Diez minutos de ajedrez, cartas o adivinanzas con quien esté libre.', tags: ['ajedrez'] },
  { id: 'plantas', cat: 'sentido', min: 5, t: 'Visita el huerto', d: 'Pasa por el módulo de plantas: mira cuánto han crecido, toca una hoja, huele la tierra húmeda.', tags: ['plantas'] },
  { id: 'lista', cat: 'crear', min: 5, t: 'Una canción para la tripulación', d: 'Añade una canción a la lista de música de la misión y cuenta por qué la elegiste.', tags: ['música'] },
  { id: 'diez', cat: 'calma', min: 1, t: 'Diez respiraciones lentas', d: 'Antes de la siguiente tarea, haz diez respiraciones lentas contando cada una.', tool: 'respirar' },
  { id: 'plan', cat: 'sentido', min: 5, t: 'Tu primer plan en la Tierra', d: 'Piensa qué comerás y a quién verás primero al volver. Cuéntaselo a alguien o escríbelo.', tags: ['cocina', 'escritura'] },
  { id: 'pregunta', cat: 'conectar', min: 5, t: 'La pregunta del día', d: 'Pregúntale a un compañero: ¿qué olor de la Tierra extrañas más?' },
  { id: 'agua', cat: 'mover', min: 2, t: 'Agua y pausa', d: 'Bebe agua y aparta la vista de las pantallas durante dos minutos.' },
  { id: 'caricatura', cat: 'crear', min: 8, t: 'Caricatura de la tripulación', d: 'Dibuja a tus compañeros como personajes de cómic y enséñales el resultado.', tool: 'dibujo', prompt: 'a tu tripulación', tags: ['dibujo'] },
  { id: 'desconexion', cat: 'calma', min: 15, t: 'Rutina para dormir', d: 'Baja las luces, deja las pantallas y prepara tu camarote con calma antes de acostarte.', noche: true },
  { id: 'porque', cat: 'sentido', min: 3, t: 'Recuerda por qué viniste', d: 'Escribe una frase sobre lo que esta misión significa para ti.', tool: 'bitacora', tags: ['escritura'] },
  { id: 'tararea', cat: 'jugar', min: 5, t: 'Adivina la canción', d: 'Tararea una canción y que un compañero la adivine. Luego cambian.', tags: ['música'] },
  { id: 'llamada', cat: 'conectar', min: 5, t: 'Prepara tu llamada a casa', d: 'Mira cuándo es tu próxima videollamada y piensa una cosa buena que quieras contar.' },
  { id: 'lectura', cat: 'calma', min: 10, t: 'Diez minutos de lectura', d: 'Lee algo que no sea un procedimiento: una novela, un cuento, un poema.', tags: ['lectura'] },
  { id: 'estrella', cat: 'sentido', min: 5, t: 'Busca una estrella', d: 'Desde la ventana, elige una estrella o una constelación y aprende su nombre.', tags: ['fotografía'] },
];
const actById = (id) => ACTS.find((x) => x.id === id);

/* ===== Bitácora ===== */
const TAGS = ['Síntoma', 'Sueño', 'Ánimo', 'Trabajo', 'Convivencia', 'Familia', 'Logro'];
const SYMS = ['Dolor de cabeza', 'Náusea', 'Congestión', 'Dolor de espalda', 'Mareo', 'Cansancio', 'Ojos irritados'];