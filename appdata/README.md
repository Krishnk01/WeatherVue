# WeatherVue - Modern Weather Dashboard

WeatherVue is a sleek, interactive weather dashboard that provides comprehensive weather information with a modern user interface. The application features real-time weather data visualization through interactive charts and an intuitive design that adapts to both light and dark themes.

## Features

- **Real-time Weather Data**: Get current weather conditions for any city worldwide
- **Interactive Charts**: Visualize weather data through customizable line and bar graphs
- **Multiple Weather Metrics**:
  - Temperature (current, feels like, high/low)
  - Precipitation and chance of rain
  - Wind conditions (speed, direction, gusts)
  - Air Quality Index (AQI, PM2.5, PM10)
  - UV Index (current and max)
  - Sun schedule (sunrise, sunset, day length)
- **Location Services**: Use your current location or search for any city
- **Theme Toggle**: Switch between light and dark modes for comfortable viewing
- **Responsive Design**: Optimized for both desktop and mobile devices

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- OpenWeatherMap API key (sign up at [OpenWeatherMap](https://openweathermap.org/api))

## Dependencies

- Chart.js - For interactive data visualization

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/WeatherVue.git
   ```

2. Navigate to the project directory:
   ```bash
   cd WeatherVue
   ```

3. Open `script.js` and replace the placeholder with your OpenWeatherMap API key:
   ```javascript
   const API_KEY = 'your_api_key_here';
   ```

4. Open `index.html` in your web browser or serve it using a local development server.

## Usage

1. Allow location access for automatic weather data based on your current location
2. Or use the search box to look up weather information for any city
3. Switch between different weather metrics using the tab buttons
4. Toggle between light and dark themes using the theme switch
5. Customize chart views between line and bar graphs using the dropdown selectors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by OpenWeatherMap API
- Charts powered by Chart.js
- Icons and emojis for weather conditions and UI elements