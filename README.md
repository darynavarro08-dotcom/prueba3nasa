# Stellar Health: salud más allá de la Tierra

Prototipo web (HTML + CSS + JS, sin dependencias) que vigila el cuerpo y la mente de una tripulación a partir de los valores que cada persona mide por su cuenta y escribe en la app. No hay sensores ni datos en tiempo real.

## Ejecutar

```sh
python3 -m http.server 8765
```

Abre http://localhost:8765/index.html.

## Qué incluye

- **Perfil y ficha de salud**: edad, peso, estatura, sexo e historial médico. Se usan para el pulso máximo en ejercicio, las guías y el plan de cuidado. Permite crear perfiles nuevos.
- **Indicadores**: temperatura, ritmo cardíaco, respiración, saturación de oxígeno y sueño. Los escribes tú en **Registrar medición**, indicando si estabas en reposo o tras ejercicio.
- **Prevención**: modelo personal entrenado con el historial; avisa de tendencias antes de que sean un problema.
- **Alerta y consejo**: alertas al guardar una medición, guías paso a paso y aviso a la tripulación si es grave o continúa.
- **Plan de cuidado psicológico**, check-ins de ánimo y actividades sencillas periódicas (dibujar una flor, hablar de tu película favorita…).
- **Bitácora** personal y **archivo de datos** (gráficas, tabla y CSV).

Datos y entradas se guardan en el `localStorage` del navegador. No es un dispositivo médico.

## Estructura

`index.html`, `styles.css` y `js/` (01 utilidades, 02 contenido, 02b perfil, 03 historial de ejemplo, 04 motor, 05 gráficas, 06 interfaz, 07 acciones y arranque).
