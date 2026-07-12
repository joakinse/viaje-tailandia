const app = document.querySelector("#app");
let map;
let mounting = false;

const escapeHtml = (value = "") => String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const typeIcon = (type) => ({ Alojamiento: "🏨", Templo: "🛕", Mercado: "🛍", "Centro de buceo": "🤿", Playa: "🏝", Mirador: "📍" })[type] || "📌";

async function mountMap() {
  if (mounting || location.hash !== "#map" || !app.querySelector(".map-placeholder")) return;
  mounting = true;
  try {
    const points = await fetch("data/map-points.json").then((response) => response.json());
    if (location.hash !== "#map") return;
    const types = [...new Set(points.map((point) => point.type))];
    app.querySelector(".map-placeholder").outerHTML = `
      <section class="map-panel card">
        <div class="map-heading">
          <div><p class="kicker">Ruta y lugares guardados</p><h1>Mapa interactivo</h1></div>
          <button class="map-fit" id="map-fit" type="button">Ver ruta completa</button>
        </div>
        <div class="map-filters" aria-label="Filtros del mapa">
          ${types.map((type) => `<button type="button" class="map-filter active" data-map-type="${escapeHtml(type)}" aria-pressed="true">${typeIcon(type)} ${escapeHtml(type)}</button>`).join("")}
        </div>
        <div id="trip-map" class="trip-map" aria-label="Mapa de la ruta por Tailandia"></div>
        <p class="map-note">Las ubicaciones marcadas como aproximadas se actualizarán cuando se cierre la reserva.</p>
      </section>`;

    if (!window.L) {
      document.querySelector("#trip-map").innerHTML = "<p>No se pudo cargar el mapa. Comprueba la conexión a internet.</p>";
      return;
    }

    map?.remove();
    map = L.map("trip-map", { scrollWheelZoom: false, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const layers = new Map();
    const bounds = [];
    points.forEach((point) => {
      if (!layers.has(point.type)) layers.set(point.type, L.layerGroup().addTo(map));
      const marker = L.marker([point.lat, point.lng], {
        icon: L.divIcon({ className: "map-marker-shell", html: `<span class="map-marker"><span>${typeIcon(point.type)}</span></span>`, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -32] }),
      });
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.query)}`;
      marker.bindPopup(`<div class="map-popup"><small>${escapeHtml(point.destination)} · ${escapeHtml(point.type)}</small><strong>${escapeHtml(point.name)}</strong>${point.approximate ? "<em>Ubicación aproximada</em>" : ""}<a href="${mapsUrl}" target="_blank" rel="noreferrer">Abrir en Google Maps</a></div>`);
      marker.addTo(layers.get(point.type));
      bounds.push([point.lat, point.lng]);
    });

    const destinations = ["Bangkok", "Chiang Mai", "Koh Tao", "Krabi", "Phi Phi"];
    const route = destinations.map((destination) => points.find((point) => point.destination === destination)).filter(Boolean).map((point) => [point.lat, point.lng]);
    L.polyline(route, { color: "#df6549", weight: 3, opacity: 0.8, dashArray: "8 10" }).addTo(map);

    const fitRoute = () => map.fitBounds(bounds, { padding: [34, 34], maxZoom: 7 });
    fitRoute();
    document.querySelector("#map-fit").addEventListener("click", fitRoute);
    document.querySelectorAll("[data-map-type]").forEach((button) => {
      button.addEventListener("click", () => {
        const layer = layers.get(button.dataset.mapType);
        const visible = map.hasLayer(layer);
        if (visible) map.removeLayer(layer); else layer.addTo(map);
        button.classList.toggle("active", !visible);
        button.setAttribute("aria-pressed", String(!visible));
      });
    });
    requestAnimationFrame(() => map.invalidateSize());
  } finally {
    mounting = false;
  }
}

new MutationObserver(() => {
  if (location.hash === "#map") mountMap();
  else if (map) {
    map.remove();
    map = undefined;
  }
}).observe(app, { childList: true, subtree: true });

window.addEventListener("hashchange", mountMap);
mountMap();
