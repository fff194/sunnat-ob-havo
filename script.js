const apiKey = "a0c388d861680b3f4c232b8afeef0bf2"; // O'zingizning OpenWeatherMap API kalitingizni yozing

const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherIcon = document.getElementById("weather-icon");
const errorMsg = document.getElementById("error-msg");
const weatherInfo = document.getElementById("weather-info");
const forecastContainer = document.getElementById("forecast-container");

async function checkWeather(city) {
    try {
        // 1. Joriy ob-havo ma'lumotlarini olish
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;
        const response = await fetch(currentWeatherUrl);

        if (response.status === 404) {
            errorMsg.style.display = "block";
            weatherInfo.style.display = "none";
            return;
        }

        const data = await response.json();

        document.getElementById("city-name").innerHTML = data.name;
        document.getElementById("temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.getElementById("humidity").innerHTML = data.main.humidity + "%";
        document.getElementById("wind").innerHTML = data.wind.speed + " km/h";
        document.getElementById("condition").innerHTML = data.weather[0].description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        errorMsg.style.display = "none";
        weatherInfo.style.display = "block";

        // 2. 5 kunlik / 3 kunlik prognoz ma'lumotlarini olish (Forecast API)
        getForecast(city);

    } catch (error) {
        console.error("Xatolik yuz berdi:", error);
    }
}

async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}&appid=${apiKey}`;
    const response = await fetch(forecastUrl);
    const data = await response.json();

    forecastContainer.innerHTML = "";

    // Har kuni uchun taxminan peshin vaqtidagi (12:00) ma'lumotni tanlab olamiz
    // API har 3 soatda ma'lumot beradi, shuning uchun list'dan kunlik farqlarni saralaymiz
    const filteredForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    // Faqat ertaga va undan keyingi 2 kunni chiqaramiz (jami 2-3 ta kun)
    for (let i = 0; i < 2; i++) {
        if (!filteredForecast[i]) break;
        const forecast = filteredForecast[i];

        // Sanani haftasiga yoki oy/kun shakliga o'tkazish
        const dateObj = new Date(forecast.dt * 1000);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('uz-UZ', options);

        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");
        forecastItem.innerHTML = `
            <span>${formattedDate}</span>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="ikon">
            <span>${temp}°C</span>
        `;
        forecastContainer.appendChild(forecastItem);
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBox.value);
    }
});

// Dastlabki ishga tushganda Toshkent shahri uchun ko'rsatish
checkWeather("Tashkent");