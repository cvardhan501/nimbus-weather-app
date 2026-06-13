/**
 * ==========================================================================
 * NIMBUS WEATHER APP - JS CORE ENGINE
 * Real-time Weather Integration & Advanced Canvas Visual Effects
 * ==========================================================================
 */

// 1. API Configuration
// IMPORTANT: Please paste your own OpenWeatherMap API Key here to run the live application.
// Sign up at: https://openweathermap.org/
const API_KEY = "c5a310138b9039a628ed1cb13fbb02c0";

// 2. DOM Elements Selection
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const locateBtn = document.getElementById("locate-btn");
const statusMessage = document.getElementById("status-message");
const statusText = document.getElementById("status-text");
const weatherDashboard = document.getElementById("weather-dashboard");
const apiModal = document.getElementById("api-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");

// Weather Info Display Elements
const cityNameEl = document.getElementById("city-name");
const countryCodeEl = document.getElementById("country-code");
const currentDateEl = document.getElementById("current-date");
const currentTempEl = document.getElementById("current-temp");
const weatherConditionEl = document.getElementById("weather-condition");
const feelsLikeTempEl = document.getElementById("feels-like-temp");
const weatherIconEl = document.getElementById("weather-icon");
const mainIconContainer = document.getElementById("main-icon-container");

// Detailed Stats Elements
const valHumidity = document.getElementById("val-humidity");
const valWind = document.getElementById("val-wind");
const valPressure = document.getElementById("val-pressure");
const valVisibility = document.getElementById("val-visibility");
const valSunrise = document.getElementById("val-sunrise");
const valSunset = document.getElementById("val-sunset");

// Forecast Container
const forecastContainer = document.getElementById("forecast-container");

// Background FX Containers
const sunElement = document.getElementById("sun-element");
const cloudContainer = document.getElementById("cloud-container");
const fogOverlay = document.getElementById("fog-overlay");
const bgGradient = document.getElementById("bg-gradient");

// 3. Canvas Animation Variables
const canvas = document.getElementById("weather-canvas");
const ctx = canvas.getContext("2d");
let canvasAnimId = null;
let drops = [];
let flakes = [];
let lightningFlash = 0; // opacity of lightning flash overlay

// Default Location if permission is denied
const DEFAULT_CITY = "Bengaluru";

// ==========================================================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Setup Canvas Resolution
    initCanvas();
    window.addEventListener("resize", initCanvas);

    // Check if API Key is set
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        showApiModal();
        // Fallback to loading default mock weather dashboard to keep the UI beautiful
        loadMockWeatherData();
    } else {
        // Auto-detect location on load
        requestLocation();
    }

    // Search input enter key event
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    // Search button click event
    searchBtn.addEventListener("click", performSearch);

    // Locate button click event
    locateBtn.addEventListener("click", () => {
        showStatus("Detecting location...");
        requestLocation();
    });

    // Close API modal helper
    modalCloseBtn.addEventListener("click", () => {
        apiModal.classList.add("hidden");
    });
});

// Helper: Show API Warning Modal
function showApiModal() {
    apiModal.classList.remove("hidden");
}

// ==========================================================================
// GEOLOCATION & GEOPOSITION FETCHING
// ==========================================================================

function requestLocation() {
    showStatus("Accessing location...");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            (error) => {
                console.warn("Geolocation access denied/failed: ", error.message);
                showStatus("Permission denied. Loading Bengaluru weather...");
                // Fallback to Bengaluru
                setTimeout(() => {
                    fetchWeatherByCity(DEFAULT_CITY);
                }, 1000);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
        showStatus("Geolocation unsupported. Loading Bengaluru weather...");
        fetchWeatherByCity(DEFAULT_CITY);
    }
}

// ==========================================================================
// WEATHER DATA API FETCHING (OpenWeatherMap)
// ==========================================================================

// Fetch Weather using latitude and longitude coordinates
async function fetchWeatherByCoords(lat, lon) {
    if (isMockMode()) return;
    showStatus("Fetching local weather...");
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        if (!weatherRes.ok || !forecastRes.ok) {
            throw new Error("Failed to load weather data from API");
        }

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        updateDashboard(weatherData, forecastData);
    } catch (err) {
        console.error("API error details:", err);
        showStatus("Error loading API data. Loading mock dashboard...");
        loadMockWeatherData();
    }
}

// Fetch Weather using City Name Query
async function fetchWeatherByCity(cityName) {
    if (isMockMode()) {
        showStatus(`Searching "${cityName}" (Mock Mode)...`);
        setTimeout(() => {
            loadMockWeatherData(cityName);
        }, 800);
        return;
    }

    if (!cityName.trim()) return;
    showStatus(`Searching "${cityName}"...`);

    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;

        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) {
            throw new Error("City not found");
        }
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) {
            throw new Error("Forecast unavailable");
        }

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        updateDashboard(weatherData, forecastData);
    } catch (err) {
        console.error("Fetch failed: ", err);
        showStatus(`Could not find city "${cityName}". Try again!`);
        setTimeout(() => {
            hideStatus();
        }, 3000);
    }
}

// Trigger city search based on search bar input value
function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        fetchWeatherByCity(query);
    }
}

// Check if app is in fallback mock mode because API Key is missing
function isMockMode() {
    return !API_KEY || API_KEY === "YOUR_API_KEY_HERE";
}

// ==========================================================================
// RENDER & DOM DATA POPULATION
// ==========================================================================

function updateDashboard(weather, forecast) {
    hideStatus();
    weatherDashboard.classList.remove("hidden");

    // 1. Core Header details
    cityNameEl.textContent = weather.name;
    countryCodeEl.textContent = weather.sys.country;

    // Calculate queried location date and time using their local timezone shift offset
    currentDateEl.textContent = formatLocalDate(weather.dt, weather.timezone);

    // 2. Temperature, Condition and Feels Like
    const currentTemp = Math.round(weather.main.temp);
    currentTempEl.textContent = currentTemp;
    
    // Capitalize first letter of weather description
    const weatherDesc = weather.weather[0].description;
    weatherConditionEl.textContent = weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);
    
    feelsLikeTempEl.textContent = Math.round(weather.main.feels_like);

    // 3. Update Icon & Background state
    const conditionId = weather.weather[0].id;
    const isDay = weather.weather[0].icon.endsWith("d");
    updateWeatherIcon(conditionId, isDay);
    changeWeatherFX(conditionId);

    // 4. Detailed Grid Stats
    valHumidity.textContent = `${weather.main.humidity}%`;
    
    // Convert m/s wind speed to km/h
    const windKmh = Math.round(weather.wind.speed * 3.6);
    valWind.textContent = `${windKmh} km/h`;
    
    valPressure.textContent = `${weather.main.pressure} hPa`;
    
    // Visibility in km
    const visibilityKm = (weather.visibility / 1000).toFixed(1);
    valVisibility.textContent = `${visibilityKm} km`;

    // Local Sunrise and Sunset times based on queried timezone offset
    valSunrise.textContent = formatLocalTime(weather.sys.sunrise, weather.timezone);
    valSunset.textContent = formatLocalTime(weather.sys.sunset, weather.timezone);

    // 5. Populate 5-Day Forecast
    renderForecast(forecast.list, weather.timezone);
}

// Generate the 5-Day forecast cards
function renderForecast(forecastList, timezoneOffset) {
    forecastContainer.innerHTML = "";

    // Group 3-hour chunks by calendar date or midday matches (12:00:00)
    // Filter forecast entries to find one closest to midday for each of the next 5 days
    const middayForecasts = forecastList.filter(item => {
        // Find forecast entries matching 12:00:00 UTC
        return item.dt_txt.includes("12:00:00");
    });

    // Fallback if no 12:00:00 items exist in the API array response
    const selectedForecasts = middayForecasts.length > 0 ? middayForecasts : forecastList.filter((_, idx) => idx % 8 === 0).slice(0, 5);

    // Loop and render each forecast day
    selectedForecasts.slice(0, 5).forEach(item => {
        const date = new Date((item.dt + timezoneOffset) * 1000);
        // Short day name, e.g., "Mon", "Tue"
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = days[date.getUTCDay()];

        const temp = Math.round(item.main.temp);
        const conditionId = item.weather[0].id;
        const mainDesc = item.weather[0].main;

        // Get matching Font Awesome icon class
        const iconClass = getForecastIconClass(conditionId);

        const card = document.createElement("div");
        card.className = "glass-card forecast-card";
        card.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <i class="${iconClass} forecast-icon"></i>
            <span class="forecast-temp">${temp}°C</span>
            <span class="forecast-desc" title="${mainDesc}">${mainDesc}</span>
        `;
        forecastContainer.appendChild(card);
    });
}

// Map weather codes to Font Awesome icons
function updateWeatherIcon(weatherId, isDay) {
    mainIconContainer.innerHTML = "";
    const icon = document.createElement("i");
    icon.className = "weather-icon fa-solid ";

    if (weatherId >= 200 && weatherId < 300) {
        icon.className += "fa-cloud-bolt"; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 400) {
        icon.className += "fa-cloud-rain"; // Drizzle
    } else if (weatherId >= 500 && weatherId < 600) {
        icon.className += "fa-cloud-showers-heavy"; // Heavy Rain
    } else if (weatherId >= 600 && weatherId < 700) {
        icon.className += "fa-snowflake"; // Snow
    } else if (weatherId >= 700 && weatherId < 800) {
        icon.className += "fa-smog"; // Haze/Fog/Mist
    } else if (weatherId === 800) {
        icon.className += isDay ? "fa-sun" : "fa-moon"; // Clear sky
    } else if (weatherId === 801) {
        icon.className += isDay ? "fa-cloud-sun" : "fa-cloud-moon"; // Few clouds
    } else if (weatherId >= 802 && weatherId <= 804) {
        icon.className += "fa-cloud"; // Scattered/Broken/Overcast clouds
    } else {
        icon.className += "fa-cloud-sun";
    }

    mainIconContainer.appendChild(icon);
}

// Helper mapping function for 5-day forecast icons
function getForecastIconClass(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "fa-solid fa-cloud-bolt";
    if (weatherId >= 300 && weatherId < 400) return "fa-solid fa-cloud-rain";
    if (weatherId >= 500 && weatherId < 600) return "fa-solid fa-cloud-showers-heavy";
    if (weatherId >= 600 && weatherId < 700) return "fa-solid fa-snowflake";
    if (weatherId >= 700 && weatherId < 800) return "fa-solid fa-smog";
    if (weatherId === 800) return "fa-solid fa-sun";
    if (weatherId === 801) return "fa-solid fa-cloud-sun";
    return "fa-solid fa-cloud";
}

// ==========================================================================
// DATE & TIME FORMATTERS (Handles queried timezone offset shifts)
// ==========================================================================

function formatLocalDate(dt, timezoneOffsetSeconds) {
    const utcDate = new Date(dt * 1000);
    const localTime = utcDate.getTime() + (timezoneOffsetSeconds * 1000);
    const date = new Date(localTime);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const dayName = days[date.getUTCDay()];
    const dateNum = date.getUTCDate();
    const monthName = months[date.getUTCMonth()];

    return `${dayName}, ${dateNum} ${monthName}`;
}

function formatLocalTime(timestamp, timezoneOffsetSeconds) {
    const utcDate = new Date(timestamp * 1000);
    const localTime = utcDate.getTime() + (timezoneOffsetSeconds * 1000);
    const date = new Date(localTime);

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${formattedMinutes} ${ampm}`;
}

// ==========================================================================
// LOADER / STATUS MESSAGE BAR CONTROLLERS
// ==========================================================================

function showStatus(text) {
    statusText.textContent = text;
    statusMessage.classList.remove("hidden");
    weatherDashboard.classList.add("hidden");
}

function hideStatus() {
    statusMessage.classList.add("hidden");
}

// ==========================================================================
// DYNAMIC VISUAL WEATHER BACKGROUND EFFECTS & CANVAS PARTICLES
// ==========================================================================

function changeWeatherFX(conditionId) {
    // 1. Reset canvas loop & HTML overlay layers
    stopCanvasAnimation();
    sunElement.classList.remove("active");
    cloudContainer.classList.remove("active");
    fogOverlay.classList.remove("active");
    cloudContainer.innerHTML = "";

    // 2. Select condition archetype
    let category = "sunny";

    if (conditionId >= 200 && conditionId < 300) {
        category = "thunderstorm";
    } else if (conditionId >= 300 && conditionId < 600) {
        category = "rain";
    } else if (conditionId >= 600 && conditionId < 700) {
        category = "snow";
    } else if (conditionId >= 700 && conditionId < 800) {
        category = "fog";
    } else if (conditionId > 800) {
        category = "cloudy";
    }

    // 3. Setup FX overlays and initiate Canvas particle renderers
    switch(category) {
        case "sunny":
            sunElement.classList.add("active");
            bgGradient.style.background = "linear-gradient(-45deg, #0f172a, #1e1b4b, #292524, #1e1b4b)";
            bgGradient.style.backgroundSize = "400% 400%";
            break;
            
        case "cloudy":
            cloudContainer.classList.add("active");
            bgGradient.style.background = "linear-gradient(-45deg, #090d16, #111827, #1f2937, #111827)";
            bgGradient.style.backgroundSize = "400% 400%";
            
            // Build animated floating clouds
            for (let i = 1; i <= 3; i++) {
                const cloud = document.createElement("div");
                cloud.className = `cloud-shape cloud-${i}`;
                cloudContainer.appendChild(cloud);
            }
            break;
            
        case "rain":
            bgGradient.style.background = "linear-gradient(-45deg, #080c14, #0f172a, #1e293b, #0f172a)";
            bgGradient.style.backgroundSize = "400% 400%";
            startCanvasAnimation("rain");
            break;
            
        case "thunderstorm":
            bgGradient.style.background = "linear-gradient(-45deg, #030712, #0f172a, #111827, #030712)";
            bgGradient.style.backgroundSize = "400% 400%";
            startCanvasAnimation("thunderstorm");
            break;
            
        case "snow":
            bgGradient.style.background = "linear-gradient(-45deg, #0f172a, #1e293b, #334155, #1e293b)";
            bgGradient.style.backgroundSize = "400% 400%";
            startCanvasAnimation("snow");
            break;
            
        case "fog":
            fogOverlay.classList.add("active");
            bgGradient.style.background = "linear-gradient(-45deg, #0f172a, #1e293b, #374151, #0f172a)";
            bgGradient.style.backgroundSize = "400% 400%";
            break;
    }
}

// Initialize Canvas Size
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Stop any running requestAnimationFrame canvas renderers
function stopCanvasAnimation() {
    if (canvasAnimId) {
        cancelAnimationFrame(canvasAnimId);
        canvasAnimId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops = [];
    flakes = [];
}

// Start specific weather animation renderer loop
function startCanvasAnimation(type) {
    stopCanvasAnimation();
    
    if (type === "rain" || type === "thunderstorm") {
        // Populate raindrops
        const maxDrops = type === "thunderstorm" ? 180 : 120;
        for (let i = 0; i < maxDrops; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                vy: 8 + Math.random() * 8,
                vx: -1.5 + Math.random() * 0.5,
                len: 12 + Math.random() * 15,
                opacity: 0.15 + Math.random() * 0.35
            });
        }
        animateRain(type);
    } else if (type === "snow") {
        // Populate snowflakes
        const maxFlakes = 100;
        for (let i = 0; i < maxFlakes; i++) {
            flakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: 1.5 + Math.random() * 3.5,
                d: 0.2 + Math.random() * 0.8,
                opacity: 0.2 + Math.random() * 0.7,
                angle: Math.random() * 2 * Math.PI,
                angleSpeed: 0.01 + Math.random() * 0.02
            });
        }
        animateSnow();
    }
}

// Animation Loop: Rain & Storm
function animateRain(type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "rgba(174, 219, 240, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    
    drops.forEach(drop => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(186, 230, 253, ${drop.opacity})`;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.vx, drop.y + drop.len);
        ctx.stroke();
        
        // Update position
        drop.y += drop.vy;
        drop.x += drop.vx;
        
        // Reset drop
        if (drop.y > canvas.height) {
            drop.y = -drop.len;
            drop.x = Math.random() * canvas.width;
        }
    });

    // Special FX for Thunderstorms: Random lightning flash
    if (type === "thunderstorm") {
        if (lightningFlash > 0) {
            lightningFlash -= 0.08;
            if (lightningFlash < 0) lightningFlash = 0;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlash})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (Math.random() < 0.004 && lightningFlash === 0) {
            lightningFlash = 0.75 + Math.random() * 0.2;
        }
    }

    canvasAnimId = requestAnimationFrame(() => animateRain(type));
}

// Animation Loop: Snow
function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    flakes.forEach(flake => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2, true);
        ctx.fill();
        
        flake.y += Math.cos(flake.angle) + 1.2 + flake.r/2;
        flake.x += Math.sin(flake.angle) * 0.7;
        flake.angle += flake.angleSpeed;
        
        // Reset flake
        if (flake.y > canvas.height || flake.x > canvas.width || flake.x < -10) {
            flake.y = -10;
            flake.x = Math.random() * canvas.width;
            flake.angle = Math.random() * 2 * Math.PI;
        }
    });
    
    canvasAnimId = requestAnimationFrame(animateSnow);
}

// ==========================================================================
// FALLBACK DEMONSTRATION MODE (Mock Weather Generator)
// ==========================================================================

function loadMockWeatherData(searchQuery = "Bengaluru") {
    const city = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.slice(1);
    
    const weatherOptions = [
        { id: 800, main: "Clear", desc: "Sunny conditions" },
        { id: 801, main: "Clouds", desc: "Few clouds" },
        { id: 803, main: "Clouds", desc: "Overcast clouds" },
        { id: 500, main: "Rain", desc: "Light shower rain" },
        { id: 211, main: "Thunderstorm", desc: "Thunderstorm with rain" },
        { id: 600, main: "Snow", desc: "Light drift snow" },
        { id: 741, main: "Fog", desc: "Hazy mist" }
    ];
    
    const charCodeSum = city.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const selection = weatherOptions[charCodeSum % weatherOptions.length];
    
    const mockTemp = 10 + (charCodeSum % 22);
    const mockWind = 5 + (charCodeSum % 20);
    const mockHumidity = 40 + (charCodeSum % 50);
    const mockPressure = 1005 + (charCodeSum % 15);
    
    const mockWeather = {
        name: city,
        dt: Math.floor(Date.now() / 1000),
        timezone: 19800, // UTC + 5:30 (India)
        sys: {
            country: "IN",
            sunrise: Math.floor(Date.now() / 1000) - 20000,
            sunset: Math.floor(Date.now() / 1000) + 30000
        },
        main: {
            temp: mockTemp,
            feels_like: mockTemp + (mockTemp > 20 ? 1 : -2),
            humidity: mockHumidity,
            pressure: mockPressure
        },
        wind: {
            speed: mockWind / 3.6
        },
        visibility: 9000,
        weather: [{
            id: selection.id,
            description: selection.desc,
            main: selection.main,
            icon: "02d"
        }]
    };
    
    const mockForecastList = [];
    
    for (let i = 1; i <= 5; i++) {
        const futureTime = Math.floor(Date.now() / 1000) + (i * 86400);
        const forecastSelection = weatherOptions[(charCodeSum + i) % weatherOptions.length];
        
        mockForecastList.push({
            dt: futureTime,
            dt_txt: new Date(futureTime * 1000).toISOString().replace("T", " ").substring(0, 10) + " 12:00:00",
            main: {
                temp: mockTemp + (i % 2 === 0 ? 2 : -2)
            },
            weather: [{
                id: forecastSelection.id,
                main: forecastSelection.main
            }]
        });
    }
    
    const mockForecast = {
        list: mockForecastList
    };
    
    setTimeout(() => {
        updateDashboard(mockWeather, mockForecast);
    }, 400);
}