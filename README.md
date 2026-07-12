# Guía de viaje a Tailandia

Guía estática mobile-first para el viaje en grupo a Tailandia.

## Arquitectura

- Shell de UI: `index.html`
- Lógica de la app: `assets/js/app.js`
- Estilos: `assets/css/app.css`
- Datos del viaje: `data/*.json`
- Contratos de datos: `schemas/*.schema.json`

El contenido del viaje está guardado en JSON para poder actualizar el itinerario sin tocar el código de la aplicación.
