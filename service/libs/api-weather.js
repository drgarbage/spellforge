const axios = require('axios');

async function fetchWeather() {
  const apiKey = 'c45101db42389c2b0170f1460bd660c1';
  const location = 'Taipei,ROC'; // e.g., 'New York,US'
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
  const response = await axios.get(url);
  return response.data.weather[0].main;
}

module.exports = { fetchWeather };