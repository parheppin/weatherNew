# weatherNew (Python)

weatherNew är en Python-version av din tidigare väderapp, med samma funktioner:

- Sök väder per stad
- Aktuell temperatur + känns som
- Vind, luftfuktighet, lufttryck
- Interaktiv karta (Leaflet)
- Prognos (OpenWeather 5-dagars / 3h-data, visad dag för dag)
- Svensk lokalisering

## Kom igång

### 1) Skapa och aktivera virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2) Installera beroenden

```powershell
pip install -r requirements.txt
```

### 3) Lägg till API-nyckel

Kopiera `.env.example` till `.env` och fyll i din OpenWeather API-nyckel:

```powershell
Copy-Item .env.example .env
```

`.env`:

```env
OPENWEATHER_API_KEY=din_faktiska_nyckel
```

### 4) Starta appen

```powershell
python app.py
```

Öppna: `http://127.0.0.1:5000`

## Struktur

- `app.py` Flask-backend + API-proxy till OpenWeather
- `templates/index.html` UI
- `static/style.css` styling
- `static/app.js` klientlogik
