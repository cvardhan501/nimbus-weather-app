# 🌤 Nimbus — Weather Intelligence App

> A premium, portfolio-grade weather application built with pure HTML, CSS & JavaScript.
> Featuring glassmorphism UI, dynamic weather effects, geolocation, 5-day forecasts, and more.

---

## ✨ Live Preview

https://nimbus-weather-app-seven.vercel.app

---

## 🚀 Features

| Feature | Details |
|---|---|
| 📍 Auto Location | Browser Geolocation API — detects your live position |
| 🔍 City Search | Search any city worldwide with error handling |
| 🌡 Current Weather | Temperature, condition, feels-like, humidity, wind, pressure, visibility |
| 🌅 Sunrise & Sunset | Times + animated arc showing sun's current position |
| 📅 5-Day Forecast | Daily high/low, icon, description |
| 🎨 Dynamic Backgrounds | Animated effects for Rain, Snow, Thunder, Sunny, Clouds, Fog/Mist |
| 💎 Glassmorphism UI | Frosted-glass cards with smooth backdrop blur |
| 📱 Fully Responsive | Works beautifully on mobile, tablet, and desktop |

---

## 🌩 Dynamic Weather Effects

| Condition | Effect |
|---|---|
| ☀️ Clear / Sunny | Glowing sun with pulsing rings & rotating rays |
| 🌧 Rain / Drizzle | Canvas particle rain animation |
| ⛈ Thunderstorm | Heavy rain + lightning bolt flashes |
| ❄️ Snow | Canvas snowfall with drifting flakes |
| ☁️ Cloudy | Slowly drifting cloud layers |
| 🌫 Fog / Mist / Haze | Layered fog drift animation |

---

## 🛠 Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, glassmorphism, keyframe animations, responsive grid
- **Vanilla JavaScript** — async/await fetch, Canvas API, Geolocation API
- **OpenWeatherMap API** — current weather + 5-day forecast
- **[Weather Icons](https://erikflowers.github.io/weather-icons/)** — icon font library
- **[Font Awesome 6](https://fontawesome.com/)** — UI icons
- **Google Fonts** — Cormorant Garamond + DM Sans

---

## ⚙️ Setup & Usage

### 1. Get a Free API Key

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Go to **My API Keys** in your account dashboard
3. Copy your API key

### 2. Add Your API Key

Open `script.js` and find line **13**:

```js
const API_KEY = "YOUR_API_KEY_HERE";
```

Replace `YOUR_API_KEY_HERE` with your actual key:

```js
const API_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
```

### 3. Run the App

No build step required. Simply open `index.html` in your browser:

```bash
# Option A — Direct open
open index.html

# Option B — Local server (recommended to avoid CORS issues)
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## 📁 Project Structure

```
nimbus-weather-app/
├── index.html      # Main HTML structure
├── style.css       # All styles, animations, responsive design
├── script.js       # All JavaScript logic & API integration
└── README.md       # This file
```

---

## 🌐 Deployment

### Deploy to GitHub Pages

```bash
# 1. Create a GitHub repository
# 2. Push your files
git init
git add .
git commit -m "🚀 Initial commit — Nimbus Weather App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nimbus-weather.git
git push -u origin main

# 3. Enable GitHub Pages in Settings → Pages → Source: main branch / root
```

Your app will be live at: `https://YOUR_USERNAME.github.io/nimbus-weather/`

### Deploy to Netlify (Drag & Drop)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag your project folder onto the deploy area
3. Done — instant live URL!

### Deploy to Vercel

```bash
npx vercel
```

---

## 🔑 API Reference

This app uses two OpenWeatherMap endpoints:

| Endpoint | Purpose |
|---|---|
| `/data/2.5/weather` | Current weather by city name or coordinates |
| `/data/2.5/forecast` | 5-day / 3-hour forecast |

Both use `units=metric` (Celsius). Change to `units=imperial` for Fahrenheit.

**Free tier limits:** 60 calls/minute, 1,000,000 calls/month — more than enough.

---

## 📸 Screens & Components

### Search Panel
- Toggle between **Auto Detect** and **Search City**
- Smooth tab transition, keyboard support (Enter key)
- Inline error messages with shake animation

### Current Weather Card
- Large typographic temperature display
- Weather icon (Weather Icons font) with float animation
- Stats row: Humidity · Wind · Pressure · Visibility
- Sunrise/Sunset with animated arc progress

### 5-Day Forecast Row
- One card per day
- Daily high & low temperatures
- Hover lift animation

---

## 🎨 Design System

| Token | Value |
|---|---|
| Display Font | Cormorant Garamond |
| Body Font | DM Sans |
| Primary Accent | `#7eb8f7` |
| Warm Accent | `#f7c97e` |
| Glass BG | `rgba(255,255,255,0.07)` |
| Glass Border | `rgba(255,255,255,0.14)` |
| Border Radius (cards) | `28px` |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

## 👤 Author

Built with ♥ as a portfolio-level project.
Powered by [OpenWeatherMap](https://openweathermap.org).

---

> ⭐ If you found this project helpful, please give it a star on GitHub!
