const itinerary = [
  {
    date: "22 agosto",
    title: "Bangkok",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Bangkok_Skyline_from_Movenpick_Hotel%2C_Asok%2C_Bangkok_at_night.jpg",
    activities: ["Llegada 18:40", "Hotel, cena y paseo"],
  },
  {
    date: "23 agosto",
    title: "Bangkok histórico",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Sunset_view_of_Wat_Arun_in_Bangkok.jpg",
    activities: ["Gran Palacio", "Wat Pho", "Wat Arun", "Khao San Road"],
  },
  {
    date: "24 agosto",
    title: "Bangkok moderno",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/50/Chinatown_in_Bangkok_%28Yaowarat%29_at_night.jpg",
    activities: ["Pak Khlong Talat", "Song Wat", "Talat Noi", "Chinatown", "Rooftop", "Tren nocturno o vuelo al día siguiente"],
  },
  {
    date: "25 agosto",
    title: "Chiang Mai",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Chiang_Mai_sunday_evening_walking_street.jpg",
    activities: ["Casco antiguo", "Wat Chedi Luang", "Wat Phra Singh", "Night Market"],
  },
  {
    date: "26 agosto",
    title: "Chiang Rai",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Wat_Rong_Khun_-_The_White_Temple_at_Chiang_Rai.jpg",
    activities: ["Templo Blanco", "Templo Azul", "Casa Negra"],
  },
  {
    date: "27 agosto",
    title: "Chiang Mai",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Doi_Suthep_Temple_Chiang_Mai_Thailand_8.jpg",
    activities: ["Santuario ético de elefantes", "Rafting opcional", "Compras y masaje"],
  },
  {
    date: "28 agosto",
    title: "Chiang Mai - Koh Tao",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Panorama_Koh_Tao_3.jpg",
    activities: ["Vuelo", "Bus + ferry"],
  },
  {
    date: "29 agosto",
    title: "Koh Tao",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Koh_Tao%2Csaireebeach_.jpg",
    activities: ["Buceo / bautizos", "Sairee Beach"],
  },
  {
    date: "30 agosto",
    title: "Koh Tao",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/53/Ko_Nang_Yuan_from_Viewpoint.jpg",
    activities: ["Koh Nang Yuan", "Motos", "Snorkel"],
  },
  {
    date: "31 agosto",
    title: "Koh Tao - Krabi",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/40/Railay_Beach_5.jpg",
    activities: ["Ferry + traslado", "Railay"],
  },
  {
    date: "1 septiembre",
    title: "Phi Phi",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Phi_Phi_Viewpoint_2_Panoramic.jpg",
    activities: ["Ferry", "Viewpoint", "Fiesta"],
  },
  {
    date: "2 septiembre",
    title: "Phi Phi",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/df/Phi_Phi_island_panorama.jpg",
    activities: ["Maya Bay", "Pileh Lagoon", "Regreso a Krabi"],
  },
  {
    date: "3 septiembre",
    title: "Krabi",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Railay%2C_Krabi%2C_Thailand.jpg",
    activities: ["Amigo: vuelo Krabi - Bangkok", "Resto: día extra en Krabi"],
  },
  {
    date: "4 septiembre",
    title: "Bangkok",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Bangkok_-_City_skyline_at_sunset.JPG",
    activities: ["Vuelo a Bangkok", "Compras y rooftop"],
  },
  {
    date: "5 septiembre",
    title: "Bangkok",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/62/Bangkok%2C_Thailand%2C_Benjakitti_Park%2C_2024.jpg",
    activities: ["Último día en Bangkok", "Aeropuerto por la noche"],
  },
];

const defaultTodos = [
  "Decidir tren o vuelo Bangkok-Chiang Mai",
  "Confirmar si alguien hará Advanced Open Water",
  "Decidir Full Moon Party",
  "Cerrar presupuesto aproximado",
  "Definir equipaje común y mochila",
  "Completar TDAC antes de viajar",
  "Reservar ferris con antelación",
];

const itineraryCards = document.querySelector("#itinerary-cards");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const storageKey = "tailandia-2026-todos";

function renderItinerary() {
  itineraryCards.innerHTML = itinerary
    .map(
      (day) => `
        <article class="day-card">
          <img src="${day.image}" alt="Imagen de ${day.title}" loading="lazy" />
          <div class="day-card__body">
            <span class="day-card__date">${day.date}</span>
            <h3>${day.title}</h3>
            <ul>${day.activities.map((activity) => `<li>${activity}</li>`).join("")}</ul>
          </div>
        </article>
      `,
    )
    .join("");
}

function getTodos() {
  const savedTodos = localStorage.getItem(storageKey);
  return savedTodos ? JSON.parse(savedTodos) : defaultTodos;
}

function saveTodos(todos) {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

function renderTodos() {
  const todos = getTodos();
  todoList.innerHTML = todos
    .map(
      (todo, index) => `
        <li class="todo-item">
          <span>${todo}</span>
          <button type="button" data-index="${index}" aria-label="Eliminar ${todo}">Eliminar</button>
        </li>
      `,
    )
    .join("");
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newTodo = todoInput.value.trim();
  if (!newTodo) return;

  const todos = getTodos();
  todos.push(newTodo);
  saveTodos(todos);
  todoInput.value = "";
  renderTodos();
});

todoList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;

  const todos = getTodos();
  todos.splice(Number(button.dataset.index), 1);
  saveTodos(todos);
  renderTodos();
});

renderItinerary();
renderTodos();
