const express = require('express');
const axios = require('axios');

const router = express.Router();

// Rechercher une ville et obtenir ses coordonnées
router.get('/search/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: 'Clé API OpenWeatherMap non configurée'
      });
    }

    // Utiliser l'API Geocoding d'OpenWeatherMap pour rechercher la ville
    const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${apiKey}`;

    const response = await axios.get(geocodeUrl);
    const cities = response.data;

    if (!cities.length) {
      return res.status(404).json({
        message: 'Aucune ville trouvée avec ce nom'
      });
    }

    // Formater les résultats
    const formattedCities = cities.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state || null,
      lat: city.lat,
      lon: city.lon
    }));

    res.json({ cities: formattedCities });

  } catch (error) {
    console.error('Erreur recherche ville:', error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        message: 'Clé API OpenWeatherMap invalide'
      });
    }

    res.status(500).json({
      message: 'Erreur lors de la recherche de ville'
    });
  }
});

// Obtenir les données météo actuelles pour une ville
router.get('/current/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: 'Clé API OpenWeatherMap non configurée'
      });
    }

    // Appel à l'API Current Weather
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

    const response = await axios.get(weatherUrl);
    const data = response.data;

    // Formater les données météo
    const weatherData = {
      location: {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
        uvIndex: null, // Nécessite un appel séparé à l'API UV
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: Math.round(data.wind?.speed * 3.6) || 0, // Conversion m/s en km/h
        windDirection: data.wind?.deg || 0
      },
      timestamp: new Date().toISOString()
    };

    res.json(weatherData);

  } catch (error) {
    console.error('Erreur données météo:', error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        message: 'Clé API OpenWeatherMap invalide'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        message: 'Coordonnées non trouvées'
      });
    }

    res.status(500).json({
      message: 'Erreur lors de la récupération des données météo'
    });
  }
});

// Obtenir les prévisions météo sur 5 jours
router.get('/forecast/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: 'Clé API OpenWeatherMap non configurée'
      });
    }

    // Appel à l'API 5 Day Weather Forecast
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

    const response = await axios.get(forecastUrl);
    const data = response.data;

    // Grouper les prévisions par jour
    const dailyForecast = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];

      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date,
          temperatures: [],
          descriptions: [],
          icons: [],
          humidity: [],
          pressure: [],
          windSpeed: []
        };
      }

      dailyForecast[date].temperatures.push(item.main.temp);
      dailyForecast[date].descriptions.push(item.weather[0].description);
      dailyForecast[date].icons.push(item.weather[0].icon);
      dailyForecast[date].humidity.push(item.main.humidity);
      dailyForecast[date].pressure.push(item.main.pressure);
      dailyForecast[date].windSpeed.push(item.wind?.speed * 3.6 || 0);
    });

    // Formater les prévisions quotidiennes
    const forecast = Object.values(dailyForecast).slice(0, 5).map(day => ({
      date: day.date,
      tempMin: Math.round(Math.min(...day.temperatures)),
      tempMax: Math.round(Math.max(...day.temperatures)),
      description: day.descriptions[Math.floor(day.descriptions.length / 2)],
      icon: day.icons[Math.floor(day.icons.length / 2)],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      pressure: Math.round(day.pressure.reduce((a, b) => a + b) / day.pressure.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length)
    }));

    res.json({
      location: {
        name: data.city.name,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon
      },
      forecast,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur prévisions météo:', error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        message: 'Clé API OpenWeatherMap invalide'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        message: 'Coordonnées non trouvées'
      });
    }

    res.status(500).json({
      message: 'Erreur lors de la récupération des prévisions météo'
    });
  }
});

module.exports = router;