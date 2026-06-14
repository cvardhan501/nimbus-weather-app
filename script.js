/* ============================================================
   NIMBUS WEATHER APP — script.js
   All JavaScript logic goes here.
   Sections:
     1. API Key & URLs
     2. Tab Switching
     3. Auto Location (Geolocation)
     4. Manual City Search
     5. Fetch Weather Data from API
     6. Display Current Weather
     7. Display 5-Day Forecast
     8. Dynamic Background Effects
     9. Rain Animation (Canvas)
    10. Snow Animation (Canvas)
    11. Sun Arc Progress
    12. Helper Functions
    13. UI Helpers (show/hide loading, error, etc.)
   ============================================================ */

/* ── 1. API KEY & URLs ── */

/*
  HOW TO GET YOUR FREE API KEY:
  1. Go to https://openweathermap.org
  2. Click "Sign Up" and create a free account
  3. Go to your Profile > "My API Keys"
  4. Copy your key and paste it below
  NOTE: New keys can take 10–30 minutes to activate
*/
const API_KEY = "c5a310138b9039a628ed1cb13fbb02c0"; // <-- Paste your key here

/* Base URL for OpenWeatherMap API */
const BASE = "https://api.openweathermap.org/data/2.5";

/* We use metric units (Celsius) — change to "imperial" for Fahrenheit */
const UNITS = "metric";

/* ── 2. TAB SWITCHING ── */

/* Called when user clicks "Auto Detect" or "Search City" tab */
function showTab(tabName) {
  /* Toggle active class on buttons */
  document
    .getElementById("tab-auto")
    .classList.toggle("active", tabName === "auto");
  document
    .getElementById("tab-manual")
    .classList.toggle("active", tabName === "manual");

  /* Show or hide the panels */
  document
    .getElementById("panel-auto")
    .classList.toggle("hidden", tabName !== "auto");
  document
    .getElementById("panel-manual")
    .classList.toggle("hidden", tabName !== "manual");

  /* Clear any previous error when switching tabs */
  hideError();
}

/* ── 3. AUTO LOCATION (Geolocation API) ── */

function detectLocation() {
  /* Check if the browser supports geolocation */
  if (!navigator.geolocation) {
    showError("Your browser does not support location detection.");
    return;
  }

  /* Disable button and show loading text while we wait */
  const btn = document.getElementById("detect-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';

  /* Ask the browser for the user's coordinates */
  navigator.geolocation.getCurrentPosition(
    /* SUCCESS: coordinates received */
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchByCoords(lat, lon); /* fetch weather using lat/lon */

      /* Reset button */
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-location-dot"></i> Detect My Location';
    },

    /* ERROR: user denied or something went wrong */
    function (error) {
      let message = "Could not get your location.";
      if (error.code === 1)
        message = "Location access denied. Please allow location permission.";
      if (error.code === 2)
        message = "Location unavailable. Try searching manually.";
      if (error.code === 3) message = "Location request timed out. Try again.";

      showError(message);
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-location-dot"></i> Detect My Location';
    },

    /* Options: give up after 10 seconds */
    { timeout: 10000 },
  );
}

/* ── 4. MANUAL CITY SEARCH ── */

function searchCity() {
  /* Get the text the user typed */
  const cityName = document.getElementById("city-input").value.trim();

  /* Don't search if input is empty */
  if (!cityName) {
    showError("Please enter a city name.");
    return;
  }

  fetchByCity(cityName);
}

/* ── 5. FETCH WEATHER DATA FROM API ── */

/* Fetch using latitude and longitude (from geolocation) */
async function fetchByCoords(lat, lon) {
  showLoading();
  try {
    /* Fetch both current weather and forecast at the same time */
    const [wRes, fRes] = await Promise.all([
      fetch(
        `${BASE}/weather?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${API_KEY}`,
      ),
      fetch(
        `${BASE}/forecast?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${API_KEY}`,
      ),
    ]);
    handleResponse(wRes, fRes);
  } catch (err) {
    hideLoading();
    showError("Network error. Please check your internet connection.");
  }
}

/* Fetch using a city name (from search box) */
async function fetchByCity(city) {
  showLoading();
  try {
    const [wRes, fRes] = await Promise.all([
      fetch(`${BASE}/weather?q=${city}&units=${UNITS}&appid=${API_KEY}`),
      fetch(`${BASE}/forecast?q=${city}&units=${UNITS}&appid=${API_KEY}`),
    ]);
    handleResponse(wRes, fRes);
  } catch (err) {
    hideLoading();
    showError("Network error. Please check your internet connection.");
  }
}

/* Process the API response */
async function handleResponse(weatherRes, forecastRes) {
  /* Check for errors (e.g. city not found, bad API key) */
  if (!weatherRes.ok) {
    hideLoading();
    if (weatherRes.status === 404)
      showError("City not found. Please check the spelling.");
    else if (weatherRes.status === 401)
      showError("Invalid API key. Please check script.js.");
    else showError("Error " + weatherRes.status + ": Could not fetch weather.");
    return;
  }

  /* Convert responses to JSON objects */
  const weatherData = await weatherRes.json();
  const forecastData = forecastRes.ok ? await forecastRes.json() : null;

  /* Hide loading and show the weather */
  hideLoading();
  hideError();
  displayWeather(weatherData);
  if (forecastData) displayForecast(forecastData);

  /* Show the weather section */
  document.getElementById("weather-section").classList.remove("hidden");
}

/* ── 6. DISPLAY CURRENT WEATHER ── */

function displayWeather(data) {
  /* Destructure the data we need from the API response */
  const cityName = data.name;
  const countryCode = data.sys.country;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const windSpeed = data.wind.speed;
  const visibility = data.visibility;
  const condition = data.weather[0].description;
  const conditionId =
    data.weather[0].id; /* numeric ID used to pick icon/effect */
  const sunriseTs = data.sys.sunrise; /* Unix timestamp */
  const sunsetTs = data.sys.sunset; /* Unix timestamp */
  const timezone = data.timezone; /* offset in seconds from UTC */

  /* ── Fill in the HTML elements ── */

  document.getElementById("city-name").textContent = cityName;
  document.getElementById("country-name").textContent =
    getCountryName(countryCode);
  document.getElementById("temp-val").textContent = temp;
  document.getElementById("condition-text").textContent = capitalise(condition);
  document.getElementById("feels-like").textContent =
    "Feels like " + feelsLike + "°";
  document.getElementById("humidity").textContent = humidity + "%";
  document.getElementById("wind").textContent =
    (windSpeed * 3.6).toFixed(1) + " km/h";
  document.getElementById("pressure").textContent = pressure + " hPa";
  document.getElementById("visibility").textContent = visibility
    ? (visibility / 1000).toFixed(1) + " km"
    : "N/A";
  document.getElementById("sunrise").textContent = formatTime(
    sunriseTs,
    timezone,
  );
  document.getElementById("sunset").textContent = formatTime(
    sunsetTs,
    timezone,
  );

  /* ── Set today's date ── */
  const localDate = getLocalDate(timezone);
  document.getElementById("week-day").textContent = localDate.dayName;
  document.getElementById("full-date").textContent = localDate.fullDate;

  /* ── Set weather icon ── */
  const isNight = checkIfNight(sunriseTs, sunsetTs, timezone);
  setWeatherIcon(conditionId, isNight);

  /* ── Animate the sunrise/sunset arc ── */
  setSunArc(sunriseTs, sunsetTs, timezone);

  /* ── Change background to match weather ── */
  setBackground(conditionId);
}

/* ── 7. DISPLAY 5-DAY FORECAST ── */

function displayForecast(data) {
  const grid = document.getElementById("forecast-grid");
  grid.innerHTML = ""; /* clear old cards */

  /* The API returns 40 entries (every 3 hours for 5 days)
     We want one reading per day — pick the one closest to noon */
  const dailyData = {};

  data.list.forEach(function (entry) {
    /* Get the date string e.g. "2025-06-15" */
    const dateKey = entry.dt_txt.split(" ")[0];

    /* Keep the noon (12:00) entry if available, otherwise first of the day */
    if (!dailyData[dateKey] || entry.dt_txt.includes("12:00")) {
      dailyData[dateKey] = entry;
    }
  });

  /* Get the 5 days and short day names */
  const days = Object.keys(dailyData).slice(0, 5);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIdx = new Date().getDay();

  days.forEach(function (dateKey, index) {
    const entry = dailyData[dateKey];

    /* Calculate correct day name from today's index */
    const dayLabel = index === 0 ? "Today" : dayNames[(todayIdx + index) % 7];

    /* Find the highest and lowest temps for this day */
    const sameDayEntries = data.list.filter((e) =>
      e.dt_txt.startsWith(dateKey),
    );
    const high = Math.round(
      Math.max(...sameDayEntries.map((e) => e.main.temp_max)),
    );
    const low = Math.round(
      Math.min(...sameDayEntries.map((e) => e.main.temp_min)),
    );

    /* Build the forecast card HTML */
    const iconInfo = getForecastIcon(entry.weather[0].id);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML =
      '<p class="fc-day ' +
      (index === 0 ? "today" : "") +
      '">' +
      dayLabel +
      "</p>" +
      '<i class="' +
      iconInfo.icon +
      " fc-icon " +
      iconInfo.colorClass +
      '"></i>' +
      '<p class="fc-high">' +
      high +
      "°</p>" +
      '<p class="fc-low">' +
      low +
      "°</p>";

    grid.appendChild(card);
  });
}

/* ── 8. DYNAMIC BACKGROUND EFFECTS ── */

/*
  Weather condition IDs from OpenWeatherMap:
  200–299 = Thunderstorm
  300–399 = Drizzle
  500–599 = Rain
  600–699 = Snow
  700–799 = Atmosphere (fog, mist, haze, smoke)
  800     = Clear sky
  801–804 = Clouds
*/
function getEffectType(conditionId) {
  if (conditionId >= 200 && conditionId < 300) return "thunder";
  if (conditionId >= 300 && conditionId < 600) return "rain";
  if (conditionId >= 600 && conditionId < 700) return "snow";
  if (conditionId >= 700 && conditionId < 800) return "fog";
  if (conditionId === 800) return "sunny";
  if (conditionId > 800) return "clouds";
  return "sunny"; /* default */
}

/* Background gradient colors for each weather type */
const BG_COLORS = {
  thunder: "linear-gradient(135deg, #08041a, #03040a, #06041a)",
  rain: "linear-gradient(135deg, #0a1828, #06101a, #040c14)",
  snow: "linear-gradient(135deg, #0e1a2e, #080d18, #050a12)",
  fog: "linear-gradient(135deg, #141820, #0a0d18, #080b14)",
  sunny: "linear-gradient(135deg, #2a1a00, #1a1000, #120c00)",
  clouds: "linear-gradient(135deg, #1a2a4a, #0d1b35, #0a1628)",
};

/* Variable to store the animation frame ID (so we can cancel it) */
let animationId = null;

function setBackground(conditionId) {
  const type = getEffectType(conditionId);

  /* Step 1: Cancel any running canvas animation */
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  /* Step 2: Clear the canvas */
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Step 3: Hide all effects */
  canvas.style.display = "none";
  document.getElementById("sun-el").style.display = "none";
  document.getElementById("lightning-el").style.display = "none";
  document.getElementById("clouds-el").style.display = "none";
  document.getElementById("fog-el").style.display = "none";

  /* Step 4: Set the body background color */
  document.body.style.background = BG_COLORS[type] || BG_COLORS.clouds;

  /* Step 5: Show the matching effect */
  if (type === "sunny") {
    document.getElementById("sun-el").style.display = "block";
  } else if (type === "clouds") {
    document.getElementById("clouds-el").style.display = "block";
  } else if (type === "fog") {
    document.getElementById("fog-el").style.display = "block";
  } else if (type === "rain") {
    canvas.style.display = "block";
    startRain(false); /* false = light rain */
  } else if (type === "thunder") {
    canvas.style.display = "block";
    document.getElementById("lightning-el").style.display = "block";
    startRain(true); /* true = heavy rain for thunderstorm */
  } else if (type === "snow") {
    canvas.style.display = "block";
    startSnow();
  }
}

/* ── 9. RAIN ANIMATION (Canvas) ── */

function startRain(isHeavy) {
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");

  /* Match canvas size to window */
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  /* Create rain drops — more drops for heavy/thunderstorm rain */
  const dropCount = isHeavy ? 260 : 140;
  const drops = [];

  for (let i = 0; i < dropCount; i++) {
    drops.push({
      x: Math.random() * canvas.width /* random horizontal position */,
      y: Math.random() * canvas.height /* random vertical position */,
      length: 10 + Math.random() * 20 /* drop length */,
      speed: (isHeavy ? 10 : 5) + Math.random() * 5 /* fall speed */,
      opacity: 0.08 + Math.random() * 0.22 /* semi-transparent */,
    });
  }

  /* Draw function — called every frame */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(function (drop) {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      /* Slight diagonal angle for the rain */
      ctx.lineTo(drop.x - drop.length * 0.2, drop.y + drop.length);
      ctx.strokeStyle = "rgba(180, 215, 255, " + drop.opacity + ")";
      ctx.lineWidth = 0.9;
      ctx.lineCap = "round";
      ctx.stroke();

      /* Move drop downward */
      drop.y += drop.speed;
      drop.x -= drop.speed * 0.2; /* slight horizontal drift */

      /* Reset drop to top when it goes off screen */
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width;
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  draw();
}

/* ── 10. SNOW ANIMATION (Canvas) ── */

function startSnow() {
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  /* Create snowflakes */
  const flakes = [];
  for (let i = 0; i < 120; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 1 + Math.random() * 2.5 /* size of snowflake */,
      speed: 0.5 + Math.random() * 1.2 /* fall speed */,
      drift: Math.random() * 0.5 - 0.25 /* left/right wobble */,
      wobble: Math.random() * Math.PI * 2 /* starting wobble angle */,
      opacity: 0.2 + Math.random() * 0.5,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    flakes.forEach(function (flake) {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 235, 255, " + flake.opacity + ")";
      ctx.fill();

      /* Move flake downward with a gentle side wobble */
      flake.y += flake.speed;
      flake.wobble += 0.018;
      flake.x += flake.drift + Math.sin(flake.wobble) * 0.35;

      /* Reset when off screen */
      if (flake.y > canvas.height) {
        flake.y = -flake.radius;
        flake.x = Math.random() * canvas.width;
      }
      /* Wrap horizontally */
      if (flake.x > canvas.width) flake.x = 0;
      if (flake.x < 0) flake.x = canvas.width;
    });

    animationId = requestAnimationFrame(draw);
  }

  draw();
}

/* ── 11. SUN ARC PROGRESS ── */

/* Shows a curved arc indicating where the sun currently is (sunrise to sunset) */
function setSunArc(sunriseTs, sunsetTs, timezoneOffset) {
  /* Current time in the city's timezone */
  const nowLocal = Date.now() / 1000 + timezoneOffset;
  const riseLocal = sunriseTs + timezoneOffset;
  const setLocal = sunsetTs + timezoneOffset;

  /* Calculate progress (0 = just after sunrise, 1 = just before sunset) */
  let progress = (nowLocal - riseLocal) / (setLocal - riseLocal);
  progress = Math.max(0, Math.min(1, progress)); /* clamp between 0 and 1 */

  /* Update the arc stroke-dashoffset (141 = full arc length) */
  const arcPath = document.getElementById("sun-arc");
  arcPath.setAttribute("stroke-dashoffset", (141 - progress * 141).toFixed(1));

  /* Move the dot along the arc path */
  /* Arc goes from left (angle = PI) to right (angle = 2*PI) over the top */
  const angle = Math.PI + progress * Math.PI;
  const cx = 50,
    cy = 50,
    r = 45; /* arc center and radius in SVG units */
  const dotX = cx + r * Math.cos(angle);
  const dotY = cy + r * Math.sin(angle);

  document.getElementById("sun-dot").setAttribute("cx", dotX.toFixed(1));
  document.getElementById("sun-dot").setAttribute("cy", dotY.toFixed(1));
}

/* ── 12. HELPER FUNCTIONS ── */

/* Convert Unix timestamp to "6:30 AM" format using city's timezone */
function formatTime(unixTs, timezoneOffsetSeconds) {
  /* Add the timezone offset to get local time */
  const date = new Date((unixTs + timezoneOffsetSeconds) * 1000);
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; /* convert 0 to 12 for 12 AM */
  return hours + ":" + minutes + " " + ampm;
}

/* Get the day name and date string for the city's local time */
function getLocalDate(timezoneOffsetSeconds) {
  const date = new Date((Date.now() / 1000 + timezoneOffsetSeconds) * 1000);
  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return {
    dayName: DAY_NAMES[date.getUTCDay()],
    fullDate:
      MONTH_NAMES[date.getUTCMonth()] +
      " " +
      date.getUTCDate() +
      ", " +
      date.getUTCFullYear(),
  };
}

/* Check if it's currently night time in the city */
function checkIfNight(sunriseTs, sunsetTs, timezoneOffset) {
  const nowLocal = Date.now() / 1000 + timezoneOffset;
  const riseLocal = sunriseTs + timezoneOffset;
  const setLocal = sunsetTs + timezoneOffset;
  return nowLocal < riseLocal || nowLocal > setLocal;
}

/* Convert country code (e.g. "GB") to full name (e.g. "United Kingdom") */
function getCountryName(code) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

/* Capitalise every word (e.g. "light rain" → "Light Rain") */
function capitalise(str) {
  return str.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
}

/* Set the weather icon and its color class based on condition ID */
function setWeatherIcon(conditionId, isNight) {
  const iconEl = document.getElementById("weather-icon");

  /* Remove all previous color classes */
  iconEl.classList.remove(
    "ic-sun",
    "ic-rain",
    "ic-snow",
    "ic-cloud",
    "ic-storm",
    "ic-fog",
  );

  let iconClass = "fas fa-cloud"; /* default */
  let colorClass = "ic-cloud";

  if (conditionId >= 200 && conditionId < 300) {
    iconClass = "fas fa-bolt";
    colorClass = "ic-storm";
  } else if (conditionId >= 300 && conditionId < 400) {
    iconClass = "fas fa-cloud-drizzle";
    colorClass = "ic-rain";
  } else if (conditionId >= 500 && conditionId < 600) {
    iconClass = "fas fa-cloud-showers-heavy";
    colorClass = "ic-rain";
  } else if (conditionId >= 600 && conditionId < 700) {
    iconClass = "fas fa-snowflake";
    colorClass = "ic-snow";
  } else if (conditionId >= 700 && conditionId < 800) {
    iconClass = "fas fa-smog";
    colorClass = "ic-fog";
  } else if (conditionId === 800) {
    iconClass = isNight ? "fas fa-moon" : "fas fa-sun";
    colorClass = "ic-sun";
  } else if (conditionId === 801) {
    iconClass = "fas fa-cloud-sun";
    colorClass = "ic-cloud";
  } else {
    iconClass = "fas fa-cloud";
    colorClass = "ic-cloud";
  }

  iconEl.className = iconClass + " " + colorClass;
}

/* Get icon class and color for forecast cards */
function getForecastIcon(conditionId) {
  if (conditionId >= 200 && conditionId < 300)
    return { icon: "fas fa-bolt", colorClass: "ic-storm" };
  if (conditionId >= 300 && conditionId < 600)
    return { icon: "fas fa-cloud-showers-heavy", colorClass: "ic-rain" };
  if (conditionId >= 600 && conditionId < 700)
    return { icon: "fas fa-snowflake", colorClass: "ic-snow" };
  if (conditionId >= 700 && conditionId < 800)
    return { icon: "fas fa-smog", colorClass: "ic-fog" };
  if (conditionId === 800) return { icon: "fas fa-sun", colorClass: "ic-sun" };
  if (conditionId === 801)
    return { icon: "fas fa-cloud-sun", colorClass: "ic-cloud" };
  return { icon: "fas fa-cloud", colorClass: "ic-cloud" };
}

/* ── 13. UI HELPERS ── */

/* Show the loading spinner, hide weather */
function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("weather-section").classList.add("hidden");
  hideError();
}

/* Hide the loading spinner */
function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

/* Show an error message */
function showError(message) {
  document.getElementById("error-text").textContent = message;
  document.getElementById("error-msg").classList.remove("hidden");
}

/* Hide the error message */
function hideError() {
  document.getElementById("error-msg").classList.add("hidden");
}
