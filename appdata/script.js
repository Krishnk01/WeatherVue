const API_KEY = '4d8fb5b93d4af21d66a2948710284366';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const themeSwitch = document.getElementById('theme-switch');
const loadingScreen = document.querySelector('.loading-screen');

// Chart instance
let forecastChart;

// Theme handling
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    if (forecastChart) {
        updateChartTheme();
    }
});

// Search handling
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    }
});

// Geolocation handling
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                hideLoading();
                alert('Unable to get your location. Please try searching for a city instead.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

// Weather data fetching
async function getWeatherByCity(city) {
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok && data.cod === 200) {
            updateWeatherUI(data);
            getForecast(data.coord.lat, data.coord.lon);
        } else {
            const errorMessage = data.message || 'City not found';
            document.querySelector('.city-name').textContent = errorMessage;
            document.querySelector('.temperature').textContent = '--°C';
            document.querySelector('.feels-like').textContent = 'Feels like: --°C';
            document.querySelector('.condition-text').textContent = '--';
            document.querySelector('.humidity').textContent = '--%';
            document.querySelector('.wind-speed').textContent = '-- m/s';
            document.querySelector('.sunrise').textContent = '--:--';
            document.querySelector('.sunset').textContent = '--:--';
            document.querySelector('.weather-icon').style.background = 'none';
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector('.city-name').textContent = 'Error fetching data';
    } finally {
        hideLoading();
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok && data.cod === 200) {
            updateWeatherUI(data);
            getForecast(lat, lon);
        } else {
            document.querySelector('.city-name').textContent = 'Location not found';
            document.querySelector('.temperature').textContent = '--°C';
            document.querySelector('.feels-like').textContent = 'Feels like: --°C';
            document.querySelector('.condition-text').textContent = '--';
            document.querySelector('.humidity').textContent = '--%';
            document.querySelector('.wind-speed').textContent = '-- m/s';
            document.querySelector('.sunrise').textContent = '--:--';
            document.querySelector('.sunset').textContent = '--:--';
            document.querySelector('.weather-icon').style.background = 'none';
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector('.city-name').textContent = 'Error fetching data';
    } finally {
        hideLoading();
    }
}

async function getForecast(lat, lon) {
    try {
        const [forecastResponse, airQualityResponse] = await Promise.all([
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);
        const forecastData = await forecastResponse.json();
        const airQualityData = await airQualityResponse.json();
        updateForecastUI(forecastData);
        updateAirQualityUI(airQualityData);
        updatePrecipitationUI(forecastData);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// UI Updates
// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
    });
});

let charts = {};

function createChart(canvasId, type, data, options) {
    const graphTypeSelector = document.getElementById(`${canvasId}-type`);
    const chartType = graphTypeSelector ? graphTypeSelector.value : type;

    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    const ctx = document.getElementById(canvasId).getContext('2d');
    const defaultOptions = {
        animation: {
            duration: 800,
            easing: 'easeInOutQuart'
        },
        responsive: true,
        maintainAspectRatio: false
    };
    charts[canvasId] = new Chart(ctx, {
        type: chartType,
        data: data,
        options: { ...defaultOptions, ...options }
    });
}

function updateWeatherUI(data) {
    // Temperature tab
    document.querySelector('.city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.querySelector('.feels-like').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.querySelector('.high').textContent = `High: ${Math.round(data.main.temp_max)}°C`;
    document.querySelector('.low').textContent = `Low: ${Math.round(data.main.temp_min)}°C`;
    document.querySelector('.condition-text').textContent = data.weather[0].description;
    document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Create temperature chart
    const hours = Array.from({length: 8}, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() + i);
        return hour.getHours() + ':00';
    });

    const tempData = {
        labels: hours,
        datasets: [{
            label: 'Temperature °C',
            data: [data.main.temp, data.main.temp - 2, data.main.temp - 4, data.main.temp - 5, 
                   data.main.temp - 3, data.main.temp - 1, data.main.temp + 1, data.main.temp + 2],
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    createChart('temp-chart', 'line', tempData, {
        responsive: true,
        maintainAspectRatio: false
    });

    // Wind tab
    document.querySelector('.wind-speed').textContent = `${data.wind.speed} m/s`;
    document.querySelector('.wind-direction').textContent = getWindDirection(data.wind.deg);
    document.querySelector('.wind-gusts').textContent = `${data.wind.gust || data.wind.speed + 2} m/s`;

    // Create wind chart
    const windData = {
        labels: hours,
        datasets: [{
            label: 'Wind Speed (m/s)',
            data: [data.wind.speed, data.wind.speed + 1, data.wind.speed - 0.5, data.wind.speed + 0.8, 
                   data.wind.speed + 1.2, data.wind.speed - 0.3, data.wind.speed + 0.5, data.wind.speed],
            borderColor: '#4ecdc4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            fill: true
        }]
    };

    createChart('wind-chart', 'line', windData, {
        responsive: true,
        maintainAspectRatio: false
    });

    // UV Index tab
    const uvIndex = Math.floor(Math.random() * 11); // Simulated UV index
    document.querySelector('.uv-value').textContent = uvIndex;
    document.querySelector('.uv-max').textContent = uvIndex + 2;

    // Create UV chart
    const uvData = {
        labels: hours,
        datasets: [{
            label: 'UV Index',
            data: [uvIndex, uvIndex + 1, uvIndex + 2, uvIndex + 1.5, 
                   uvIndex + 0.5, uvIndex - 0.5, uvIndex - 1, uvIndex - 1.5],
            borderColor: '#ffd93d',
            backgroundColor: 'rgba(255, 217, 61, 0.1)',
            fill: true
        }]
    };

    createChart('uv-chart', 'line', uvData, {
        responsive: true,
        maintainAspectRatio: false
    });

    // Sun schedule
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.querySelector('.sunrise').textContent = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.querySelector('.sunset').textContent = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const dayLength = (data.sys.sunset - data.sys.sunrise) / 3600;
    document.querySelector('.day-length').textContent = `${Math.floor(dayLength)}h ${Math.round((dayLength % 1) * 60)}m`;

    // Create sun chart
    const sunData = {
        labels: ['Dawn', 'Sunrise', 'Morning', 'Noon', 'Afternoon', 'Sunset', 'Dusk'],
        datasets: [{
            label: 'Daylight',
            data: [0, 30, 60, 100, 60, 30, 0],
            borderColor: '#ffd93d',
            backgroundColor: 'rgba(255, 217, 61, 0.1)',
            fill: true
        }]
    };

    createChart('sun-chart', 'line', sunData, {
        responsive: true,
        maintainAspectRatio: false
    });
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function updatePrecipitationUI(data) {
    const precipData = data.list.slice(0, 8).map(item => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit' }),
        precipitation: item.pop * 100,
        amount: item.rain ? item.rain['3h'] || 0 : 0
    }));

    document.querySelector('.rain-chance').textContent = `${Math.round(precipData[0].precipitation)}%`;
    document.querySelector('.precip-amount').textContent = `${precipData[0].amount.toFixed(1)} mm`;

    const precipChartData = {
        labels: precipData.map(item => item.time),
        datasets: [{
            label: 'Chance of Rain (%)',
            data: precipData.map(item => item.precipitation),
            borderColor: '#4a90e2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            fill: true
        }]
    };

    createChart('precip-chart', 'line', precipChartData, {
        responsive: true,
        maintainAspectRatio: false
    });
}

function updateAirQualityUI(data) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    document.querySelector('.aqi-value').textContent = aqi;
    document.querySelector('.pm25-value').textContent = `${components.pm2_5.toFixed(1)} µg/m³`;
    document.querySelector('.pm10-value').textContent = `${components.pm10.toFixed(1)} µg/m³`;

    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336'];

    const aqiChartData = {
        labels: aqiLabels,
        datasets: [{
            label: 'Air Quality Index',
            data: [1, 2, 3, 4, 5],
            backgroundColor: aqiColors,
            borderWidth: 0
        }]
    };

    createChart('aqi-chart', 'bar', aqiChartData, {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                display: false
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    });
}

function updateForecastUI(data) {
    // Update hourly forecast
    const hourlyContainer = document.querySelector('.hourly-container');
    hourlyContainer.innerHTML = '';
    
    data.list.slice(0, 8).forEach(item => {
        const hour = new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        
        hourlyContainer.innerHTML += `
            <div class="hourly-item">
                <div>${hour}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
                <div>${temp}°C</div>
            </div>
        `;
    });

    // Update 5-day forecast chart
    const dailyData = processDailyForecast(data.list);
    updateForecastChart(dailyData);
}

function processDailyForecast(forecastList) {
    const dailyData = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                icon: item.weather[0].icon
            };
        }
        dailyData[date].temps.push(item.main.temp);
    });

    return Object.entries(dailyData).slice(0, 5).map(([date, data]) => ({
        date,
        temp: Math.round(data.temps.reduce((sum, temp) => sum + temp, 0) / data.temps.length),
        icon: data.icon
    }));
}

function updateForecastChart(dailyData) {
    const ctx = document.getElementById('forecast-chart').getContext('2d');
    
    if (forecastChart) {
        forecastChart.destroy();
    }

    const chartConfig = {
        type: 'bar',
        data: {
            labels: dailyData.map(day => day.date),
            datasets: [{
                label: 'Temperature °C',
                data: dailyData.map(day => day.temp),
                backgroundColor: 'rgba(33, 150, 243, 0.8)',
                borderColor: '#2196f3',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: 'rgba(33, 150, 243, 1)',
                barThickness: 30,
                maxBarThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#666',
                    bodyColor: '#666',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: (items) => items[0].raw + '°C',
                        label: (item) => `${dailyData[item.dataIndex].date}`
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        callback: value => `${value}°C`,
                        font: {
                            size: 12
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        padding: 8
                    }
                }
            }
        }
    };

    forecastChart = new Chart(ctx, chartConfig);
    updateChartTheme();
}

function updateChartTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#fff' : '#666';
    
    forecastChart.options.scales.x.ticks.color = textColor;
    forecastChart.options.scales.y.ticks.color = textColor;
    forecastChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    forecastChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    forecastChart.update();
}

// Loading screen
function showLoading() {
    loadingScreen.classList.add('active');
}

function hideLoading() {
    loadingScreen.classList.remove('active');
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeSwitch.checked = true;
        document.body.classList.add('dark-mode');
    }

    // Try to get user's location on load
    locationBtn.click();
});