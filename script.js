const API_KEY = "fbabfe03d58e438eb72184244250904";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";
const FORECAST_URL = "https://api.weatherapi.com/v1/forecast.json";

// DOM Elements
const searchButton = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherContainer = document.getElementById("weather-container");
const modeToggle = document.getElementById("mode-toggle");
const sunIcon = document.getElementById("sun");
const moonIcon = document.getElementById("moon");
const weatherModal = document.getElementById("weather-modal");
const closeModalButton = document.getElementById("close-modal-btn");
const modalDay = document.getElementById("modal-day");
const modalTemp = document.getElementById("modal-temp");
const modalHumidity = document.getElementById("modal-humidity");
const modalWind = document.getElementById("modal-wind");
const modeMessage = document.getElementById("mode-message");
const loadingContainer = document.getElementById("loading");

// Event Listeners
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

closeModalButton.addEventListener("click", () => {
  weatherModal.style.display = "none";
});

weatherModal.addEventListener("click", (e) => {
  if (e.target === weatherModal) {
    weatherModal.style.display = "none";
  }
});

modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");
  sunIcon.style.display = isDark ? "block" : "none";
  moonIcon.style.display = isDark ? "none" : "block";

  modeMessage.textContent = isDark
    ? "🌙 Dark Mode Activated"
    : "🌞 Light Mode Activated";
  modeMessage.classList.add("show");
  setTimeout(() => {
    modeMessage.classList.remove("show");
  }, 1500);
});

// Utility Functions
function getWeatherEmoji(conditionText) {
  const text = conditionText.toLowerCase();
  if (text.includes("sun") || text.includes("clear")) return "☀️";
  if (text.includes("cloud")) return "☁️";
  if (text.includes("rain")) return "🌧️";
  if (text.includes("storm") || text.includes("thunder")) return "⛈️";
  if (text.includes("snow")) return "❄️";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze"))
    return "🌫️";
  return "🌡️";
}

function showLoading() {
  loadingContainer.style.display = "block";
  weatherContainer.style.display = "none";
}

function hideLoading() {
  loadingContainer.style.display = "none";
}

// API Functions
async function fetchWeather(city) {
  showLoading();
  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${city}&aqi=no`);
    const data = await response.json();

    if (data.error) {
      alert(data.error.message);
      hideLoading();
    } else {
      displayWeather(data);
      fetchForecast(city);
    }
  } catch (error) {
    alert("Error fetching weather data");
    hideLoading();
  }
}

function displayWeather(data) {
  const { name, region, country, localtime } = data.location;
  const { temp_c, condition, humidity, wind_kph, feelslike_c } = data.current;
  const emoji = getWeatherEmoji(condition.text);

  weatherContainer.innerHTML = `
    <div class="current-weather">
      <h2 class="location">${name}, ${region}, ${country}</h2>
      <p class="time">${new Date(localtime).toLocaleString()}</p>
      <div class="temperature">${temp_c}°C</div>
      <p class="condition">${emoji} ${condition.text}</p>
    </div>
    
    <div class="weather-details">
      <div class="detail-card">
        <i class="fas fa-thermometer-half"></i>
        <h4>Feels Like</h4>
        <p>${feelslike_c}°C</p>
      </div>
      <div class="detail-card">
        <i class="fas fa-tint"></i>
        <h4>Humidity</h4>
        <p>${humidity}%</p>
      </div>
      <div class="detail-card">
        <i class="fas fa-wind"></i>
        <h4>Wind Speed</h4>
        <p>${wind_kph} km/h</p>
      </div>
    </div>
    
    <div class="forecast" id="forecast"></div>
  `;

  weatherContainer.style.display = "block";
  weatherContainer.classList.add("show");
  hideLoading();
}

async function fetchForecast(city) {
  try {
    const response = await fetch(
      `${FORECAST_URL}?key=${API_KEY}&q=${city}&days=3&aqi=no`
    );
    const data = await response.json();
    const forecast = data.forecast.forecastday.slice(1, 3);
    displayForecast(forecast);
  } catch (error) {
    console.error("Error fetching forecast data");
  }
}

function displayForecast(forecast) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML =
    '<h3 style="text-align: center; margin-bottom: 2rem; color: #ffd700; font-size: 1.5rem;">2-Day Forecast</h3>';

  forecast.forEach((day) => {
    const { date, day: dayData, astro } = day;
    const dayName = new Date(date).toLocaleString("en-US", { weekday: "long" });

    forecastContainer.innerHTML += `
      <div class="forecast-day" onclick='showModal("${dayName}", {
        maxtemp_c: ${dayData.maxtemp_c},
        mintemp_c: ${dayData.mintemp_c},
        avgtemp_c: ${dayData.avgtemp_c},
        humidity: ${dayData.avghumidity},
        wind_kph: ${dayData.maxwind_kph},
        condition: ${JSON.stringify(dayData.condition)},
        daily_chance_of_rain: ${dayData.daily_chance_of_rain},
        sunrise: "${astro.sunrise}",
        sunset: "${astro.sunset}"
      })'>
        <h4>${dayName}</h4>
        <img src="https:${dayData.condition.icon}" alt="weather icon" />
        <p class="temp">${dayData.avgtemp_c}°C</p>
      </div>
    `;
  });
}

function showModal(dayName, data) {
  const {
    maxtemp_c,
    mintemp_c,
    avgtemp_c,
    humidity,
    wind_kph,
    condition,
    daily_chance_of_rain,
    sunrise,
    sunset,
  } = data;

  const emoji = getWeatherEmoji(condition.text);

  modalDay.textContent = `${emoji} Weather on ${dayName}`;

  modalTemp.innerHTML = `
    <strong>Condition:</strong> ${emoji} ${condition.text}<br>
    <strong>Max Temp:</strong> ${maxtemp_c}°C<br>
    <strong>Min Temp:</strong> ${mintemp_c}°C<br>
    <strong>Avg Temp:</strong> ${avgtemp_c}°C
  `;

  modalHumidity.innerHTML = `
    <strong>Humidity:</strong> ${humidity}%<br>
    <strong>Chance of Rain:</strong> ${daily_chance_of_rain}%
  `;

  modalWind.innerHTML = `
    <strong>Wind Speed:</strong> ${wind_kph} km/h<br>
    <strong>Sunrise:</strong> ${sunrise}<br>
    <strong>Sunset:</strong> ${sunset}
  `;

  weatherModal.style.display = "flex";
}
