# Thailand Travel Hub

Mobile-first static travel guide for the Thailand group trip.

## Architecture

- UI shell: `index.html`
- App logic: `assets/js/app.js`
- Styles: `assets/css/app.css`
- Trip data: `data/*.json`
- Data contracts: `schemas/*.schema.json`

Trip content is intentionally stored in JSON so the itinerary can be updated without changing application code.
