import { useState, useEffect } from 'react';

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
  const [city, setCity] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
              `&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            ),
          ]);

          const weatherData = await weatherRes.json();
          const geoData = await geoRes.json();

          setWeather({
            temp: Math.round(weatherData.current.temperature_2m),
            unit: weatherData.current_units.temperature_2m,
            condition: weatherLabel(weatherData.current.weather_code),
          });

          const addr = geoData.address ?? {};
          setCity(addr.city || addr.town || addr.village || addr.county || null);
        } catch {
          // Silently fail — weather is non-critical
        }
      },
      () => setPermissionDenied(true),
    );
  }, []);

  return { weather, city, permissionDenied };
}
