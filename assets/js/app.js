const DATA_FILES = {
  trip: "data/trip.json",
  destinations: "data/destinations.json",
  itinerary: "data/itinerary.json",
  transport: "data/transport.json",
  accommodations: "data/accommodations.json",
  activities: "data/activities.json",
  restaurants: "data/restaurants.json",
  tips: "data/tips.json",
  budget: "data/budget.json",
  checklist: "data/checklist.json",
  decisions: "data/decisions.json",
  mapPoints: "data/map-points.json",
};

const ICONS = { home: "🏠", itinerary: "📅", transport: "✈️", accommodation: "🏨", map: "🗺", activities: "🤿", food: "🍜", budget: "💰", checklist: "📋", decisions: "❓", info: "ℹ" };
const app = document.querySelector("#app");
const nav = document.querySelector("#nav");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menu-button");
let state = {};

const esc = (value = "") => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const hash = () => location.hash.replace("#", "") || "home";
const photo = (id) => state.destinations.find((destination) => destination.id === id)?.image || state.destinations[0]?.image;

async function loadData() {
  const entries = await Promise.all(Object.entries(DATA_FILES).map(async ([key, url]) => [key, await fetch(url).then((response) => response.json())]));
  state = Object.fromEntries(entries);
}

function buildNav() {
  nav.innerHTML = `
    ${navLink("home", ICONS.home, "Inicio")}
    <div class="nav-group">
      ${navLink("itinerary", ICONS.itinerary, "Itinerario")}
      <div class="nav-sub">
        ${navLink("itinerary", "", "Itinerario completo")}
        ${state.destinations.map((destination) => navLink(`destination/${destination.id}`, "", destination.name)).join("")}
      </div>
    </div>
    ${navLink("transport", ICONS.transport, "Transporte")}
    ${navLink("accommodation", ICONS.accommodation, "Alojamiento")}
    ${navLink("map", ICONS.map, "Mapa interactivo")}
    ${navLink("activities", ICONS.activities, "Actividades")}
    ${navLink("food", ICONS.food, "Comida y noche")}
    ${navLink("budget", ICONS.budget, "Presupuesto")}
    ${navLink("checklist", ICONS.checklist, "Lista de viaje")}
    ${navLink("decisions", ICONS.decisions, "Decisiones pendientes")}
    ${navLink("info", ICONS.info, "Información útil")}
  `;
  document.querySelector("[data-trip-dates]").textContent = state.trip.dates;
}

function navLink(route, icon, label) {
  return `<a href="#${route}" data-route="${route}">${icon ? `<span>${icon}</span>` : ""}<span>${label}</span></a>`;
}

function setTitle(title, kicker = "Guía de viaje") {
  document.querySelector("#section-title").textContent = title;
  document.querySelector("#section-kicker").textContent = kicker;
  document.querySelectorAll("[data-route]").forEach((link) => link.classList.toggle("active", hash() === link.dataset.route));
}

function page(title, content, kicker) {
  setTitle(title, kicker);
  app.innerHTML = `<div class="page">${content}</div>`;
  app.focus({ preventScroll: true });
}

function renderHome() {
  const days = Math.max(0, Math.ceil((new Date(state.trip.departureDate) - new Date()) / 86400000));
  page("Inicio", `
    <section class="hero-card" style="--image:url('${photo("bangkok")}')">
      <p class="kicker">${esc(state.trip.dates)}</p>
      <h1>${esc(state.trip.name)}</h1>
      <p>Una guía mobile-first para planificar el viaje y usarla durante la ruta.</p>
    </section>
    <section class="grid grid-4">
      ${metric("Cuenta atrás", `${days} días`, "hasta la salida")}
      ${metric("Reservas", state.trip.reservationStatus, "estado actual")}
      ${metric("Presupuesto", `${state.trip.currentBudget} ${state.trip.currency}`, "estimado")}
      ${metric("Prioridad", state.trip.recommendation, "recomendación")}
    </section>
    <section class="grid grid-2">
      <div class="card"><h2>Previsión orientativa</h2>${state.trip.weather.map((w) => `<p><strong>${esc(w.destination)}</strong>: ${esc(w.summary)} · ${esc(w.temperature)}</p>`).join("")}</div>
      <div class="card"><h2>Avisos importantes</h2>${state.trip.alerts.map((alert) => `<p class="status pending">${esc(alert)}</p>`).join("")}</div>
    </section>
    <section class="grid grid-4">${state.trip.quickLinks.map((link) => `<a class="card" href="#${esc(link.route)}"><h3>${esc(link.label)}</h3><p>Abrir sección →</p></a>`).join("")}</section>
  `, "Panel");
}

function metric(label, value, hint) {
  return `<article class="card metric"><span class="kicker">${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(hint)}</small></article>`;
}

function renderItinerary() {
  page("Itinerario completo", `
    <div class="section-title"><div><p class="kicker">Cronología desplegable</p><h1>Itinerario completo</h1></div></div>
    <section class="timeline">${state.itinerary.map((day, index) => dayDetails(day, index === 0)).join("")}</section>
  `, "Itinerario");
}

function dayDetails(day, open = false) {
  return `<div class="timeline-item"><span class="timeline-dot"></span><details class="card" ${open ? "open" : ""}>
    <summary><div><strong>${esc(day.date)} · ${esc(day.destination)}</strong><p>${esc(day.activities.join(" · "))}</p></div><span class="status ${day.reservations.toLowerCase().includes("pendiente") ? "pending" : ""}">${esc(day.reservations)}</span></summary>
    <div class="details-body">
      <div class="meta-grid">${meta("Alojamiento", day.accommodation)}${meta("Transporte", day.transportation)}${meta("Presupuesto", `${day.estimatedBudget} EUR`)}${meta("Mapa", day.mapQuery)}</div>
      <p>${esc(day.notes)}</p>
      <div class="schedule">${day.schedule.map(scheduleRow).join("")}</div>
    </div>
  </details></div>`;
}

function meta(label, value) { return `<div class="meta"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`; }
function scheduleRow(item) {
  return `<article class="schedule-row"><time>${esc(item.hour)}</time><div><strong>${esc(item.activity)}</strong><ul><li>${esc(item.transportation)}</li><li>${esc(item.duration)}</li><li>${esc(item.estimatedCost)}</li><li>${esc(item.location)}</li><li>${esc(item.bookingStatus)}</li></ul><p>${esc(item.notes)}</p></div></article>`;
}

function renderDestination(id) {
  const destination = state.destinations.find((item) => item.id === id) || state.destinations[0];
  const days = state.itinerary.filter((day) => day.destinationId === destination.id);
  page(destination.name, `
    <section class="hero-card" style="--image:url('${destination.image}')"><p class="kicker">Guía del destino</p><h1>${esc(destination.name)}</h1><p>${esc(destination.overview)}</p></section>
    <section class="grid grid-3">${card("Mejores zonas", list(destination.bestAreas))}${card("Presupuesto", `<p>${esc(destination.budget)}</p>`)}${card("Reservas", list(destination.reservations))}</section>
    <section class="grid grid-2">${Object.entries(destination.sections).map(([title, values]) => card(title, list(values))).join("")}</section>
    <section><div class="section-title"><div><p class="kicker">Plan diario detallado</p><h2>Día a día</h2></div></div><div class="timeline">${days.map((day) => dayDetails(day, true)).join("")}</div></section>
    <section class="grid grid-2">${card("Google Maps", `<p>Enlace de mapa para ${esc(destination.name)}.</p><a class="chip" href="${esc(destination.googleMaps)}" target="_blank" rel="noreferrer">Abrir Google Maps</a>`)}<div class="photo-card" style="--image:url('${destination.image}')"><h2>Imágenes de ${esc(destination.name)}</h2></div></section>
  `, "Destino");
}

function card(title, body) { return `<article class="card"><h2>${esc(title)}</h2>${body}</article>`; }
function list(items) { return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`; }

function renderTransport() {
  page("Transporte", `<div class="section-title"><div><p class="kicker">Traslados</p><h1>Transporte</h1></div></div><section class="grid">${state.transport.map((transfer) => `<details class="card"><summary><div><strong>${esc(transfer.origin)} → ${esc(transfer.destination)}</strong><p>${esc(transfer.recommendedOption)} · ${esc(transfer.estimatedDuration)} · ${esc(transfer.estimatedPrice)}</p></div><span class="status pending">${esc(transfer.reservationStatus)}</span></summary><div class="details-body"><p>${esc(transfer.notes)}</p><a class="chip" href="${esc(transfer.bookingWebsite)}" target="_blank" rel="noreferrer">Web de reserva</a><div class="grid grid-2">${transfer.options.map((option) => card(option.name, `${meta("Precio", option.price)}${meta("Duración", option.duration)}<h3>Ventajas</h3>${list(option.advantages)}<h3>Desventajas</h3>${list(option.disadvantages)}<p class="status pending">${esc(option.reservation)}</p>`)).join("")}</div></div></details>`).join("")}</section>`, "Logística");
}

function renderAccommodation() { page("Alojamiento", `<div class="section-title"><div><p class="kicker">Calendario</p><h1>Alojamiento</h1></div></div>${table(["Fechas","Destino","Alojamiento","Estado","Entrada","Salida","Referencia","Notas"], state.accommodations.map((a) => [a.date,a.destination,a.hotel,a.bookingStatus,a.checkIn,a.checkOut,a.bookingReference,a.notes]))}`, "Alojamientos"); }

function renderMap() {
  page("Mapa interactivo", `<section class="map-placeholder"><p class="kicker">Mapa pendiente</p><h1>Ruta del viaje y sitios guardados</h1><p>El modelo de datos ya separa hoteles, templos, restaurantes, miradores, playas, centros de buceo, vida nocturna, mercados y puntos de transporte. Este bloque se puede sustituir más adelante por Google Maps, Mapbox o Leaflet.</p><div class="map-route">${state.mapPoints.map((point) => `<span class="map-pin">${esc(point.type)} · ${esc(point.name)}</span>`).join("")}</div></section>`, "Mapa");
}

function renderActivities() { page("Actividades", `<div class="section-title"><div><p class="kicker">Agrupadas por destino</p><h1>Actividades</h1></div></div><section class="grid grid-2">${state.activities.map((activity) => `<article class="card"><h2>${esc(activity.name)}</h2><p class="status">${esc(activity.destination)}</p><p>${esc(activity.description)}</p><div class="meta-grid">${meta("Duración", activity.duration)}${meta("Precio", activity.price)}${meta("Dificultad", activity.difficulty)}${meta("Estado", activity.reservationStatus)}</div><h3>Consejos</h3>${list(activity.tips)}</article>`).join("")}</section>`, "Experiencias"); }

function renderFood() { page("Comida y noche", `<div class="section-title"><div><p class="kicker">Restaurantes, cafés y bares</p><h1>Comida y noche</h1></div></div><section class="grid grid-2">${state.restaurants.map((place) => card(place.destination, `${meta("Rango de precios", place.priceRange)}<h3>Restaurantes</h3>${list(place.restaurants)}<h3>Comida callejera</h3>${list(place.streetFood)}<h3>Cafés</h3>${list(place.cafes)}<h3>Bares y noche</h3>${list([...place.bars, ...place.nightlife])}<h3>Platos típicos</h3>${list(place.typicalDishes)}`)).join("")}</section>`, "Comida"); }

function renderBudget() {
  const max = Math.max(...state.budget.categories.map((category) => category.estimated));
  page("Presupuesto", `<section class="grid grid-3">${metric("Estimado", `${state.budget.estimatedBudget} ${state.budget.currency}`, "total")}${metric("Gastado", `${state.budget.currentExpenses} ${state.budget.currency}`, "actual")}${metric("Restante", `${state.budget.remainingBudget} ${state.budget.currency}`, "pendiente")}</section><section class="card"><h2>Gráficos</h2>${state.budget.categories.map((category) => `<p><strong>${esc(category.name)}</strong> · estimado ${category.estimated} ${state.budget.currency} · gastado ${category.spent} ${state.budget.currency}</p><div class="progress"><span style="width:${Math.round((category.estimated / max) * 100)}%"></span></div>`).join("")}</section>`, "Dinero");
}

function renderChecklist() {
  page("Lista de viaje", `<div class="section-title"><div><p class="kicker">Preparación del viaje</p><h1>Lista de viaje</h1></div></div><section class="grid grid-2">${state.checklist.map((group) => card(group.category, group.items.map((item) => `<label class="check-item"><input type="checkbox" data-check="${esc(group.category)}:${esc(item)}" />${esc(item)}</label>`).join(""))).join("")}</section>`, "Equipaje");
  restoreChecks();
}

function restoreChecks() {
  const saved = JSON.parse(localStorage.getItem("thailand-checklist") || "{}");
  document.querySelectorAll("[data-check]").forEach((input) => {
    input.checked = Boolean(saved[input.dataset.check]);
    input.addEventListener("change", () => {
      saved[input.dataset.check] = input.checked;
      localStorage.setItem("thailand-checklist", JSON.stringify(saved));
    });
  });
}

function renderDecisions() { page("Decisiones pendientes", `<div class="section-title"><div><p class="kicker">Todavía por decidir</p><h1>Decisiones pendientes</h1></div></div><section class="grid grid-2">${state.decisions.map((decision) => card(decision.description, `<p class="status ${decision.priority === "Alta" ? "pending" : ""}">${esc(decision.priority)} prioridad · ${esc(decision.decisionStatus)}</p><h3>Opciones</h3>${list(decision.possibleOptions)}<h3>Pros</h3>${list(decision.pros)}<h3>Contras</h3>${list(decision.cons)}`)).join("")}</section>`, "Decisiones"); }
function renderInfo() { page("Información útil", `<div class="section-title"><div><p class="kicker">Consejos para Tailandia</p><h1>Información útil</h1></div></div><section class="grid grid-2">${state.tips.map((tip) => card(tip.topic, `<p>${esc(tip.description)}</p>`)).join("")}</section>`, "Info"); }

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function route() {
  const current = hash();
  if (current === "home") renderHome();
  else if (current === "itinerary") renderItinerary();
  else if (current.startsWith("destination/")) renderDestination(current.split("/")[1]);
  else if (current === "transport") renderTransport();
  else if (current === "accommodation") renderAccommodation();
  else if (current === "map") renderMap();
  else if (current === "activities") renderActivities();
  else if (current === "food") renderFood();
  else if (current === "budget") renderBudget();
  else if (current === "checklist") renderChecklist();
  else if (current === "decisions") renderDecisions();
  else if (current === "info") renderInfo();
  else renderHome();
  sidebar.classList.remove("open");
}

menuButton.addEventListener("click", () => sidebar.classList.toggle("open"));
window.addEventListener("hashchange", route);

loadData().then(() => {
  buildNav();
  route();
}).catch((error) => {
  app.innerHTML = `<div class="card"><h1>No se pudieron cargar los datos del viaje</h1><p>${esc(error.message)}</p></div>`;
});
