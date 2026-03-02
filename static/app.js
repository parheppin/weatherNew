const API_URL = '/api/weather';
const FORECAST_URL = '/api/forecast';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const errorMsg = document.getElementById('error-msg');

const cityName = document.getElementById('city-name');
const date = document.getElementById('date');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-desc');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const mapContainer = document.getElementById('map-container');
const forecastContainer = document.getElementById('forecast-container');
const forecastDays = document.getElementById('forecast-days');

let map = null;
let marker = null;

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

async function getWeatherData(city) {
    try {
        hideError();
        weatherInfo.classList.add('hidden');
        forecastContainer.classList.add('hidden');

        const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
                throw new Error('Staden hittades inte');
            }
            if (response.status === 401) {
                throw new Error('Ogiltig API-nyckel. Hämta en gratis nyckel från openweathermap.org');
            }
            throw new Error(errorData.message || 'Kunde inte hämta väderdata');
        }

        const data = await response.json();
        displayWeatherData(data);
        getForecastData(city);
    } catch (error) {
        showError(error.message);
    }
}

function displayWeatherData(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    date.textContent = getCurrentDate();

    temp.textContent = Math.round(data.main.temp);
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherDesc.textContent = data.weather[0].description;

    feelsLike.textContent = Math.round(data.main.feels_like);
    humidity.textContent = data.main.humidity;
    wind.textContent = data.wind.speed.toFixed(1);
    pressure.textContent = data.main.pressure;

    updateMap(data.coord.lat, data.coord.lon, data.name);

    weatherInfo.classList.remove('hidden');
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
}

function hideError() {
    errorMsg.classList.add('hidden');
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function getForecastData(city) {
    try {
        const response = await fetch(`${FORECAST_URL}?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            throw new Error('Kunde inte hämta prognosdata');
        }

        const data = await response.json();
        displayForecastData(data);
    } catch (error) {
        console.error('Fel vid hämtning av prognos:', error);
    }
}

function displayForecastData(data) {
    forecastDays.innerHTML = '';

    const dailyData = {};

    data.list.forEach(item => {
        const itemDate = new Date(item.dt * 1000);
        const dateKey = itemDate.toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                temps: [],
                weather: item.weather[0],
                date: itemDate
            };
        }

        dailyData[dateKey].temps.push(item.main.temp);
    });

    const days = Object.values(dailyData).slice(0, 10);

    days.forEach(day => {
        const maxTemp = Math.round(Math.max(...day.temps));
        const minTemp = Math.round(Math.min(...day.temps));

        const dayCard = document.createElement('div');
        dayCard.className = 'forecast-day';

        const dayName = day.date.toLocaleDateString('sv-SE', { weekday: 'short' });
        const dayDate = day.date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });

        dayCard.innerHTML = `
            <div class="forecast-date">
                <div class="day-name">${dayName}</div>
                <div class="day-date">${dayDate}</div>
            </div>
            <img src="https://openweathermap.org/img/wn/${day.weather.icon}.png" alt="${day.weather.description}" />
            <div class="forecast-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
            <div class="forecast-desc">${day.weather.description}</div>
        `;

        forecastDays.appendChild(dayCard);
    });

    forecastContainer.classList.remove('hidden');
}

function updateMap(lat, lon, selectedCityName) {
    mapContainer.classList.remove('hidden');

    if (!map) {
        map = L.map('map').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10);
    }

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${selectedCityName}</b>`)
        .openPopup();
}
