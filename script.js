const itinerary = [
  {
    date: "22 agosto",
    title: "Bangkok",
    image: "https://source.unsplash.com/900x650/?bangkok,skyline,night,chao-phraya",
    activities: ["Llegada 18:40", "Hotel, cena y paseo"],
  },
  {
    date: "23 agosto",
    title: "Bangkok histórico",
    image: "https://source.unsplash.com/900x650/?wat-arun,bangkok,sunset",
    activities: ["Gran Palacio", "Wat Pho", "Wat Arun", "Khao San Road"],
  },
  {
    date: "24 agosto",
    title: "Bangkok moderno",
    image: "https://source.unsplash.com/900x650/?bangkok,chinatown,yaowarat",
    activities: ["Pak Khlong Talat", "Song Wat", "Talat Noi", "Chinatown", "Rooftop", "Tren nocturno o vuelo al día siguiente"],
  },
  {
    date: "25 agosto",
    title: "Chiang Mai",
    image: "https://source.unsplash.com/900x650/?chiang-mai,old-city,temple",
    activities: ["Casco antiguo", "Wat Chedi Luang", "Wat Phra Singh", "Night Market"],
  },
  {
    date: "26 agosto",
    title: "Chiang Rai",
    image: "https://source.unsplash.com/900x650/?wat-rong-khun,white-temple,thailand",
    activities: ["Templo Blanco", "Templo Azul", "Casa Negra"],
  },
  {
    date: "27 agosto",
    title: "Chiang Mai",
    image: "https://source.unsplash.com/900x650/?chiang-mai,elephant,sanctuary",
    activities: ["Santuario ético de elefantes", "Rafting opcional", "Compras y masaje"],
  },
  {
    date: "28 agosto",
    title: "Chiang Mai - Koh Tao",
    image: "https://source.unsplash.com/900x650/?koh-tao,aerial,beach",
    activities: ["Vuelo", "Bus + ferry"],
  },
  {
    date: "29 agosto",
    title: "Koh Tao",
    image: "https://source.unsplash.com/900x650/?scuba-diving,koh-tao",
    activities: ["Buceo / bautizos", "Sairee Beach"],
  },
  {
    date: "30 agosto",
    title: "Koh Tao",
    image: "https://source.unsplash.com/900x650/?koh-nang-yuan,viewpoint",
    activities: ["Koh Nang Yuan", "Motos", "Snorkel"],
  },
  {
    date: "31 agosto",
    title: "Koh Tao - Krabi",
    image: "https://source.unsplash.com/900x650/?railay-beach,krabi,thailand",
    activities: ["Ferry + traslado", "Railay"],
  },
  {
    date: "1 septiembre",
    title: "Phi Phi",
    image: "https://source.unsplash.com/900x650/?phi-phi,islands,viewpoint",
    activities: ["Ferry", "Viewpoint", "Fiesta"],
  },
  {
    date: "2 septiembre",
    title: "Phi Phi",
    image: "https://source.unsplash.com/900x650/?maya-bay,phi-phi,thailand",
    activities: ["Maya Bay", "Pileh Lagoon", "Regreso a Krabi"],
  },
  {
    date: "3 septiembre",
    title: "Krabi",
    image: "https://source.unsplash.com/900x650/?ao-nang,longtail-boats,krabi",
    activities: ["Amigo: vuelo Krabi - Bangkok", "Resto: día extra en Krabi"],
  },
  {
    date: "4 septiembre",
    title: "Bangkok",
    image: "https://source.unsplash.com/900x650/?mahanakhon,bangkok,skyline",
    activities: ["Vuelo a Bangkok", "Compras y rooftop"],
  },
  {
    date: "5 septiembre",
    title: "Bangkok",
    image: "https://source.unsplash.com/900x650/?bangkok,rooftop,night",
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
