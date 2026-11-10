// Poprawki oznaczone komentarzem "[Claude Opus 5.5]" dodał Claude Opus 5.5

const API_KEY = "1f0903f34f430449f859c9d6a1e09490";

document.getElementById("addButton").addEventListener("click", () => {
  const city = document.getElementById("searchInput").value.trim();
  if (!city) return;
  getCurrent(city);
  getForecast(city);
});

function getCurrent(city) {
  const xhr = new XMLHttpRequest();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
  xhr.open("GET", url, true);
  xhr.onload = () => {
    // [Claude Opus 5.5] zmiana: komunikaty trafiają do #currentWeather zamiast #current,
    // żeby nie nadpisywać nagłówka "Pogoda bieżąca"
    const box = document.getElementById("currentWeather");
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      console.log(data);
      showCurrent(data);
    } else if (xhr.status === 401) {
      // [Claude Opus 5.5] dodane: osobny komunikat dla błędnego / jeszcze nieaktywnego klucza API
      box.textContent = "Błędny lub jeszcze nieaktywny klucz API";
    } else {
      box.textContent = "Nie znaleziono miejscowości";
    }
  };
  // [Claude Opus 5.5] dodane: obsługa błędu sieci (brak internetu, zablokowane żądanie)
  xhr.onerror = () => {
    document.getElementById("currentWeather").textContent = "Błąd połączenia";
  };
  xhr.send();
}

// [Claude Opus 5.5] zmiana: XMLHttpRequest zastąpiony przez Fetch API
function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
  const box = document.getElementById("forecastList");
  fetch(url)
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Błędny lub jeszcze nieaktywny klucz API");
      }
      // fetch nie odrzuca obietnicy przy statusach 4xx/5xx, trzeba sprawdzić je ręcznie
      if (!response.ok) {
        throw new Error("Nie znaleziono miejscowości");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      showForecast(data);
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        box.textContent = "Błąd połączenia";
      } else {
        box.textContent = error.message;
      }
    });
}

function showCurrent(d) {
  document.getElementById("currentWeather").innerHTML = `
    <h2>${d.name}</h2>
    <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" alt="">
    <p>${Math.round(d.main.temp)}°C, ${d.weather[0].description}</p>
    <p>Odczuwalna: ${Math.round(d.main.feels_like)}°C</p>`;
}

function showForecast(d) {
  const box = document.getElementById("forecastList");
  // [Claude Opus 5.5] zmiana: wpisy co 3 godziny pogrupowane po dniach, każdy dzień to jeden wiersz
  const timezone = d.city.timezone;
  let html = "";
  let lastDay = "";
  for (let i = 0; i < d.list.length; i++) {
    const item = d.list[i];
    const date = new Date((item.dt + timezone) * 1000);
    const dayKey = date.toISOString().slice(0, 10);
    if (dayKey !== lastDay) {
      if (lastDay !== "") {
        html += "</div></li>";
      }
      const dayName = date.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
      html += `<li class="forecast-day"><h3>${dayName}</h3><div class="forecast-hours">`;
      lastDay = dayKey;
    }
    const time = date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    const description = item.weather[0].description;
    html += `
      <div class="forecast-hour" title="${description}">
        <p class="hour">${time}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${description}">
        <p class="temp">${Math.round(item.main.temp)}°</p>
      </div>`;
  }
  if (lastDay !== "") {
    html += "</div></li>";
  }
  box.innerHTML = html;
}
