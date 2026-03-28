import { useState, useEffect } from 'react';

// Hard-coded to zip 78653 (Manor, TX)
const LATITUDE  = 30.3413;
const LONGITUDE = -97.5169;
const CITY      = 'Manor, TX';

const WMO_LABELS = {
  0: 'Clear',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

function weatherLabel(code) {
  return WMO_LABELS[code] ?? 'Unknown';
}

export function useWeather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
      `&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          unit: data.current_units.temperature_2m,
          condition: weatherLabel(data.current.weather_code),
        });
      })
      .catch(() => {});
  }, []);

  return { weather, city: CITY };
}
