import os

import requests
from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def get_api_key() -> str:
    api_key = os.getenv("OPENWEATHER_API_KEY", "")
    if not api_key:
        raise ValueError("API key missing. Set OPENWEATHER_API_KEY in environment or .env file.")
    return api_key


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/weather")
def weather():
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"message": "Stad saknas"}), 400

    try:
        response = requests.get(
            WEATHER_URL,
            params={
                "q": city,
                "appid": get_api_key(),
                "units": "metric",
                "lang": "sv",
            },
            timeout=10,
        )
    except ValueError as error:
        return jsonify({"message": str(error)}), 500
    except requests.RequestException:
        return jsonify({"message": "Kunde inte nå vädertjänsten"}), 502

    if not response.ok:
        try:
            payload = response.json()
            message = payload.get("message", "Kunde inte hämta väderdata")
        except ValueError:
            message = "Kunde inte hämta väderdata"
        return jsonify({"message": message}), response.status_code

    return jsonify(response.json())


@app.route("/api/forecast")
def forecast():
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"message": "Stad saknas"}), 400

    try:
        response = requests.get(
            FORECAST_URL,
            params={
                "q": city,
                "appid": get_api_key(),
                "units": "metric",
                "lang": "sv",
            },
            timeout=10,
        )
    except ValueError as error:
        return jsonify({"message": str(error)}), 500
    except requests.RequestException:
        return jsonify({"message": "Kunde inte nå vädertjänsten"}), 502

    if not response.ok:
        try:
            payload = response.json()
            message = payload.get("message", "Kunde inte hämta prognosdata")
        except ValueError:
            message = "Kunde inte hämta prognosdata"
        return jsonify({"message": message}), response.status_code

    return jsonify(response.json())


if __name__ == "__main__":
    app.run(debug=True)
