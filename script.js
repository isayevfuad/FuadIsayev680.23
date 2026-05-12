const today = new Date().toISOString().slice(0, 10);

// Демонстрационная база данных: рейсы хранятся в памяти, пока открыта страница.
// В реальной системе эти данные обычно приходят из базы данных или с сервера.
let routes = [
  {
    id: 1,
    from: "Баку",
    to: "Гянджа",
    date: today,
    time: "08:30",
    platform: 3,
    seats: 18,
    price: 12,
    status: "Посадка"
  },
  {
    id: 2,
    from: "Баку",
    to: "Шеки",
    date: today,
    time: "10:15",
    platform: 5,
    seats: 26,
    price: 14,
    status: "По расписанию"
  },
  {
    id: 3,
    from: "Сумгаит",
    to: "Баку",
    date: today,
    time: "11:00",
    platform: 2,
    seats: 9,
    price: 4,
    status: "Задержан"
  },
  {
    id: 4,
    from: "Баку",
    to: "Ленкорань",
    date: today,
    time: "13:40",
    platform: 7,
    seats: 31,
    price: 11,
    status: "По расписанию"
  }
];

const routesTable = document.querySelector("#routesTable");
const resultCount = document.querySelector("#resultCount");
const routeCount = document.querySelector("#routeCount");
const seatCount = document.querySelector("#seatCount");
const nextRoute = document.querySelector("#nextRoute");
const routeSelect = document.querySelector("#routeSelect");
const bookingMessage = document.querySelector("#bookingMessage");
const stationClock = document.querySelector("#stationClock");
const passengerTip = document.querySelector("#passengerTip");

// Полезные советы для пассажира: они автоматически меняются в главном блоке.
const tips = [
  "Приходите на автовокзал за 20 минут до отправления.",
  "Проверьте платформу на табло перед посадкой.",
  "Сохраните номер рейса до окончания поездки.",
  "Если рейс задержан, следите за обновлением статуса."
];

document.querySelector("#dateInput").value = today;
document.querySelector("#adminDate").value = today;

// Возвращает CSS-класс для визуального отображения статуса рейса.
function statusClass(status) {
  if (status === "Посадка") return "status-boarding";
  if (status === "Задержан") return "status-late";
  return "status-ok";
}

// Читает значения из полей поиска и оставляет только подходящие рейсы.
// Поиск работает сразу по нескольким параметрам: откуда, куда, дата и статус.
function getFilteredRoutes() {
  const from = document.querySelector("#fromInput").value.trim().toLowerCase();
  const to = document.querySelector("#toInput").value.trim().toLowerCase();
  const date = document.querySelector("#dateInput").value;
  const status = document.querySelector("#statusInput").value;

  return routes.filter((route) => {
    const fromMatch = !from || route.from.toLowerCase().includes(from);
    const toMatch = !to || route.to.toLowerCase().includes(to);
    const dateMatch = !date || route.date === date;
    const statusMatch = !status || route.status === status;
    return fromMatch && toMatch && dateMatch && statusMatch;
  });
}

// Рисует таблицу рейсов на странице.
// После каждого поиска, бронирования или добавления рейса таблица обновляется заново.
function renderRoutes() {
  const filteredRoutes = getFilteredRoutes();
  routesTable.innerHTML = "";

  if (filteredRoutes.length === 0) {
    routesTable.innerHTML = `
      <tr>
        <td colspan="7">По выбранным параметрам рейсы не найдены.</td>
      </tr>
    `;
  } else {
    filteredRoutes.forEach((route) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${route.from} - ${route.to}</strong></td>
        <td>${formatDate(route.date)}</td>
        <td>${route.time}</td>
        <td>${route.platform}</td>
        <td>${route.seats}</td>
        <td>${route.price} AZN</td>
        <td><span class="route-status ${statusClass(route.status)}">${route.status}</span></td>
      `;
      routesTable.appendChild(row);
    });
  }

  resultCount.textContent = `${filteredRoutes.length} найдено`;
  updateSummary();
  updateRouteSelect();
}

// Обновляет маленькие карточки статистики в главном блоке.
// Здесь считаются рейсы за сегодня, свободные места и ближайшее время отправления.
function updateSummary() {
  const todayRoutes = routes.filter((route) => route.date === today);
  const totalSeats = todayRoutes.reduce((sum, route) => sum + route.seats, 0);
  const sorted = [...todayRoutes].sort((a, b) => a.time.localeCompare(b.time));

  routeCount.textContent = todayRoutes.length;
  seatCount.textContent = totalSeats;
  nextRoute.textContent = sorted[0] ? sorted[0].time : "--:--";
}

// Обновляет список рейсов в форме бронирования.
// Если мест уже нет, такой рейс не показывается в выпадающем списке.
function updateRouteSelect() {
  routeSelect.innerHTML = "";
  routes
    .filter((route) => route.seats > 0)
    .forEach((route) => {
      const option = document.createElement("option");
      option.value = route.id;
      option.textContent = `${route.from} - ${route.to}, ${route.time}, ${route.price} AZN`;
      routeSelect.appendChild(option);
    });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU").format(new Date(value));
}

// Живые часы автовокзала: время обновляется каждую секунду.
function updateClock() {
  if (!stationClock) return;
  stationClock.textContent = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

// Меняет совет пассажиру каждые несколько секунд.
function rotatePassengerTip() {
  if (!passengerTip) return;
  const index = Math.floor(Date.now() / 5000) % tips.length;
  passengerTip.textContent = tips[index];
}

// Обработка формы поиска: страница не перезагружается, а таблица обновляется через JS.
document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderRoutes();
});

// Кнопка сброса возвращает фильтры к начальному состоянию.
document.querySelector("#resetFilters").addEventListener("click", () => {
  document.querySelector("#searchForm").reset();
  document.querySelector("#dateInput").value = today;
  renderRoutes();
});

// Бронирование билета: проверяем свободные места и уменьшаем их количество.
document.querySelector("#bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedRoute = routes.find((route) => route.id === Number(routeSelect.value));
  const ticketCount = Number(document.querySelector("#ticketCount").value);
  const passengerName = document.querySelector("#passengerName").value.trim();
  const passengerPhone = document.querySelector("#passengerPhone").value.trim();

  if (!selectedRoute || selectedRoute.seats < ticketCount) {
    showBookingMessage("Недостаточно свободных мест для выбранного рейса.");
    return;
  }

  selectedRoute.seats -= ticketCount;
  showBookingMessage(
    `Заявка принята: ${passengerName}, ${passengerPhone}. Рейс ${selectedRoute.from} - ${selectedRoute.to}, билетов: ${ticketCount}.`
  );
  event.target.reset();
  document.querySelector("#ticketCount").value = 1;
  renderRoutes();
});

// Форма диспетчера добавляет новый рейс прямо в табло.
// Это имитирует работу сотрудника автовокзала в информационной системе.
document.querySelector("#adminForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const newRoute = {
    id: Date.now(),
    from: document.querySelector("#adminFrom").value.trim(),
    to: document.querySelector("#adminTo").value.trim(),
    date: document.querySelector("#adminDate").value,
    time: document.querySelector("#adminTime").value,
    platform: Number(document.querySelector("#adminPlatform").value),
    seats: Number(document.querySelector("#adminSeats").value),
    price: Number(document.querySelector("#adminPrice").value),
    status: document.querySelector("#adminStatus").value
  };

  routes.push(newRoute);
  event.target.reset();
  document.querySelector("#adminDate").value = today;
  renderRoutes();
});

// Показывает сообщение после успешного или неуспешного бронирования.
function showBookingMessage(text) {
  bookingMessage.textContent = text;
  bookingMessage.classList.add("show");
}

// Первый запуск: сразу выводим рейсы, статистику, часы и советы.
renderRoutes();
updateClock();
rotatePassengerTip();
setInterval(updateClock, 1000);
setInterval(rotatePassengerTip, 5000);
