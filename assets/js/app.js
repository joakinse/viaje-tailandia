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
    ${navLink("home", ICONS.home, "Home")}
    <div class="nav-group">
      ${navLink("itinerary", ICONS.itinerary, "Itinerary")}
      <div class="nav-sub">
        ${navLink("itinerary", "", "Full itinerary")}
        ${state.destinations.map((destination) => navLink(`destination/${destination.id}`, "", destination.name)).join("")}
      </div>
    </div>
    ${navLink("transport", ICONS.transport, "Transport")}
    ${navLink("accommodation", ICONS.accommodation, "Accommodation")}
    ${navLink("map", ICONS.map, "Interactive Map")}
    ${navLink("activities", ICONS.activities, "Activities")}
    ${navLink("food", ICONS.food, "Food & Nightlife")}
    ${navLink("budget", ICONS.budget, "Budget")}
    ${navLink("checklist", ICONS.checklist, "Checklist")}
    ${navLink("decisions", ICONS.decisions, "Open Decisions")}
    ${navLink("info", ICONS.info, "Useful Information")}
  `;
  document.querySelector("[data-trip-dates]").textContent = state.trip.dates;
}

function navLink(route, icon, label) {
  return `<a href="#${route}" data-route="${route}">${icon ? `<span>${icon}</span>` : ""}<span>${label}</span></a>`;
}

function setTitle(title, kicker = "Travel guide") {
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
  page("Home", `
    <section class="hero-card" style="--image:url('${photo("bangkok")}')">
      <p class="kicker">${esc(state.trip.dates)}</p>
      <h1>${esc(state.trip.name)}</h1>
      <p>A mobile-first travel guide for planning and using during the trip.</p>
    </section>
    <section class="grid grid-4">
      ${metric("Countdown", `${days} days`, "until departure")}
      ${metric("Reservations", state.trip.reservationStatus, "current status")}
      ${metric("Budget", `${state.trip.currentBudget} ${state.trip.currency}`, "estimated")}
      ${metric("Today", state.trip.recommendation, "recommendation")}
    </section>
    <section class="grid grid-2">
      <div class="card"><h2>Weather placeholders</h2>${state.trip.weather.map((w) => `<p><strong>${esc(w.destination)}</strong>: ${esc(w.summary)} · ${esc(w.temperature)}</p>`).join("")}</div>
      <div class="card"><h2>Important alerts</h2>${state.trip.alerts.map((alert) => `<p class="status pending">${esc(alert)}</p>`).join("")}</div>
    </section>
    <section class="grid grid-4">${state.trip.quickLinks.map((link) => `<a class="card" href="#${esc(link.route)}"><h3>${esc(link.label)}</h3><p>Open section →</p></a>`).join("")}</section>
  `, "Dashboard");
}

function metric(label, value, hint) {
  return `<article class="card metric"><span class="kicker">${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(hint)}</small></article>`;
}

function renderItinerary() {
  page("Full itinerary", `
    <div class="section-title"><div><p class="kicker">Expandable timeline</p><h1>Full itinerary</h1></div></div>
    <section class="timeline">${state.itinerary.map((day, index) => dayDetails(day, index === 0)).join("")}</section>
  `, "Itinerary");
}

function dayDetails(day, open = false) {
  return `<div class="timeline-item"><span class="timeline-dot"></span><details class="card" ${open ? "open" : ""}>
    <summary><div><strong>${esc(day.date)} · ${esc(day.destination)}</strong><p>${esc(day.activities.join(" · "))}</p></div><span class="status ${day.reservations.toLowerCase().includes("pending") ? "pending" : ""}">${esc(day.reservations)}</span></summary>
    <div class="details-body">
      <div class="meta-grid">${meta("Accommodation", day.accommodation)}${meta("Transport", day.transportation)}${meta("Budget", `${day.estimatedBudget} EUR`)}${meta("Map", day.mapQuery)}</div>
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
    <section class="hero-card" style="--image:url('${destination.image}')"><p class="kicker">Destination guide</p><h1>${esc(destination.name)}</h1><p>${esc(destination.overview)}</p></section>
    <section class="grid grid-3">${card("Best areas", list(destination.bestAreas))}${card("Budget", `<p>${esc(destination.budget)}</p>`)}${card("Reservations", list(destination.reservations))}</section>
    <section class="grid grid-2">${Object.entries(destination.sections).map(([title, values]) => card(title, list(values))).join("")}</section>
    <section><div class="section-title"><div><p class="kicker">Detailed daily schedule</p><h2>Day by day</h2></div></div><div class="timeline">${days.map((day) => dayDetails(day, true)).join("")}</div></section>
    <section class="grid grid-2">${card("Google Maps", `<p>Placeholder map link for ${esc(destination.name)}.</p><a class="chip" href="${esc(destination.googleMaps)}" target="_blank" rel="noreferrer">Open Google Maps</a>`)}<div class="photo-card" style="--image:url('${destination.image}')"><h2>${esc(destination.name)} images</h2></div></section>
  `, "Destination");
}

function card(title, body) { return `<article class="card"><h2>${esc(title)}</h2>${body}</article>`; }
function list(items) { return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`; }

function renderTransport() {
  page("Transport", `<div class="section-title"><div><p class="kicker">Transfers</p><h1>Transport</h1></div></div><section class="grid">${state.transport.map((transfer) => `<details class="card"><summary><div><strong>${esc(transfer.origin)} → ${esc(transfer.destination)}</strong><p>${esc(transfer.recommendedOption)} · ${esc(transfer.estimatedDuration)} · ${esc(transfer.estimatedPrice)}</p></div><span class="status pending">${esc(transfer.reservationStatus)}</span></summary><div class="details-body"><p>${esc(transfer.notes)}</p><a class="chip" href="${esc(transfer.bookingWebsite)}" target="_blank" rel="noreferrer">Booking website</a><div class="grid grid-2">${transfer.options.map((option) => card(option.name, `${meta("Price", option.price)}${meta("Duration", option.duration)}<h3>Advantages</h3>${list(option.advantages)}<h3>Disadvantages</h3>${list(option.disadvantages)}<p class="status pending">${esc(option.reservation)}</p>`)).join("")}</div></div></details>`).join("")}</section>`, "Logistics");
}

function renderAccommodation() { page("Accommodation", `<div class="section-title"><div><p class="kicker">Calendar</p><h1>Accommodation</h1></div></div>${table(["Date","Destination","Hotel","Status","Check-in","Check-out","Reference","Notes"], state.accommodations.map((a) => [a.date,a.destination,a.hotel,a.bookingStatus,a.checkIn,a.checkOut,a.bookingReference,a.notes]))}`, "Hotels"); }

function renderMap() {
  page("Interactive Map", `<section class="map-placeholder"><p class="kicker">Map placeholder</p><h1>Trip route and saved places</h1><p>The data model already separates hotels, temples, restaurants, viewpoints, beaches, dive centers, nightlife, markets and transportation points. This placeholder can be replaced later by Google Maps, Mapbox or Leaflet.</p><div class="map-route">${state.mapPoints.map((point) => `<span class="map-pin">${esc(point.type)} · ${esc(point.name)}</span>`).join("")}</div></section>`, "Map");
}

function renderActivities() { page("Activities", `<div class="section-title"><div><p class="kicker">Grouped by destination</p><h1>Activities</h1></div></div><section class="grid grid-2">${state.activities.map((activity) => `<article class="card"><h2>${esc(activity.name)}</h2><p class="status">${esc(activity.destination)}</p><p>${esc(activity.description)}</p><div class="meta-grid">${meta("Duration", activity.duration)}${meta("Price", activity.price)}${meta("Difficulty", activity.difficulty)}${meta("Status", activity.reservationStatus)}</div><h3>Tips</h3>${list(activity.tips)}</article>`).join("")}</section>`, "Experiences"); }

function renderFood() { page("Food & Nightlife", `<div class="section-title"><div><p class="kicker">Restaurants, cafés and bars</p><h1>Food & Nightlife</h1></div></div><section class="grid grid-2">${state.restaurants.map((place) => card(place.destination, `${meta("Price range", place.priceRange)}<h3>Restaurants</h3>${list(place.restaurants)}<h3>Street food</h3>${list(place.streetFood)}<h3>Cafés</h3>${list(place.cafes)}<h3>Bars & nightlife</h3>${list([...place.bars, ...place.nightlife])}<h3>Typical dishes</h3>${list(place.typicalDishes)}`)).join("")}</section>`, "Food"); }

function renderBudget() {
  const max = Math.max(...state.budget.categories.map((category) => category.estimated));
  page("Budget", `<section class="grid grid-3">${metric("Estimated", `${state.budget.estimatedBudget} ${state.budget.currency}`, "total")}${metric("Spent", `${state.budget.currentExpenses} ${state.budget.currency}`, "current")}${metric("Remaining", `${state.budget.remainingBudget} ${state.budget.currency}`, "left")}</section><section class="card"><h2>Charts</h2>${state.budget.categories.map((category) => `<p><strong>${esc(category.name)}</strong> · ${category.estimated} ${state.budget.currency}</p><div class="progress"><span style="width:${Math.round((category.estimated / max) * 100)}%"></span></div>`).join("")}</section>`, "Money");
}

function renderChecklist() {
  page("Checklist", `<div class="section-title"><div><p class="kicker">Travel preparation</p><h1>Checklist</h1></div></div><section class="grid grid-2">${state.checklist.map((group) => card(group.category, group.items.map((item) => `<label class="check-item"><input type="checkbox" data-check="${esc(group.category)}:${esc(item)}" />${esc(item)}</label>`).join(""))).join("")}</section>`, "Packing");
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

function renderDecisions() { page("Open Decisions", `<div class="section-title"><div><p class="kicker">Still to decide</p><h1>Open Decisions</h1></div></div><section class="grid grid-2">${state.decisions.map((decision) => card(decision.description, `<p class="status ${decision.priority === "High" ? "pending" : ""}">${esc(decision.priority)} priority · ${esc(decision.decisionStatus)}</p><h3>Options</h3>${list(decision.possibleOptions)}<h3>Pros</h3>${list(decision.pros)}<h3>Cons</h3>${list(decision.cons)}`)).join("")}</section>`, "Decisions"); }
function renderInfo() { page("Useful Information", `<div class="section-title"><div><p class="kicker">Thailand tips</p><h1>Useful Information</h1></div></div><section class="grid grid-2">${state.tips.map((tip) => card(tip.topic, `<p>${esc(tip.description)}</p>`)).join("")}</section>`, "Info"); }

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
  app.innerHTML = `<div class="card"><h1>Could not load trip data</h1><p>${esc(error.message)}</p></div>`;
});
