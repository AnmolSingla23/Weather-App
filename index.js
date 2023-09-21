const API_KEY = "4e5d5d96210e3e41be164d5e5d0e289b";

const userTab = document.querySelector("[user-weather]");
const searchTab = document.querySelector("[search-weather]");
const userContainer = document.querySelector(".weather-container");
const searchForm = document.querySelector("[data-searchform]");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const loadingScreen = document.querySelector('.loading-container');
const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

let currentTab = userTab;
currentTab.classList.add("current-tab");

getfromSessionStorage();


function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        //if search form is invisble make it viible
        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass current tab as parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass current tab as parameter
    switchTab(searchTab);
});

//chks coordinates are already presnt in sessions storage
function getfromSessionStorage() {
    const localcoord = sessionStorage.getItem("user-coordinates");
    if (!localcoord) {
        //if coord are not stored
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localcoord);
        fetchUserWeather(coordinates);
    }
}

async function fetchUserWeather(coordinates) {
    const { lat, lon } = coordinates;
    //make grant container hide
    grantAccessContainer.classList.remove("active");
    //make loading scree visible
    loadingScreen.classList.add("active");

    //call api
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWaetherInfo(data);
    }
    catch (err) {
        // alert(err.stringify);
        loadingScreen.classList.remove('active');
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener("click", fetchUserWeather);
    }
}

function renderWaetherInfo(weatherInfo) {

    const cityName = document.querySelector("[data-cityname]");
    const flag = document.querySelector("[data-countryicon]");
    const desc = document.querySelector("[data-weatherdesc]");
    const weathericon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-wind]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-cloud]");


    //dynamically adding the values to ui
    cityName.innerText = weatherInfo?.name;
    flag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weathericon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener("click", getLoaction);

function getLoaction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPostion);
    }
    else {
        grantAccessButton.style.display = 'none';
        alert("Please give access to Loaction..")
    }
}

function showPostion(position) {
    const usercoord = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(usercoord));
    fetchUserWeather(usercoord);
}

const searchInput = document.querySelector("[data-searchinput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "")
        return;
    else
        fetchSearchWeather(cityName);
})

async function fetchSearchWeather(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("avtive");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWaetherInfo(data);
    }
    catch (e) {
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}