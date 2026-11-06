
interface coordinates{
  latitude : number,
  longitude : number,
}


async function getCoordinates(cityName : string){
  try{
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5&language=en&format=json`
    const response = await fetch(url)
    const locationData = await response.json();
    const latitude = locationData?.results[0]?.latitude;
    const longitude = locationData?.results[0]?.longitude;

    if(!latitude || !longitude){
      throw new Error("this place doesnt exsist");
    }

    return {
      latitude,
      longitude
    }
  }catch(e){
    console.log(e);
  }
}

async function getWeatherInfo(coordinates : coordinates){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=5`
    const response = await fetch(url);
    const weatherData = response.json();
    return weatherData;
  }catch(e){
    console.log(e)
  }
}

async function getWeather(cityName : string) : Promise<any> {
  try{
    if(!cityName && cityName === ""){
      return
    }
    const coordinates = await getCoordinates(cityName);
    const errorDiv = document.getElementById("error");

    if(!errorDiv) return;
    if(!coordinates){
      errorDiv.style.display = "block";
      errorDiv.innerText = "your location couldnt be located"
      return;
    }

    const weatherData = await getWeatherInfo(coordinates)
    
    const currentWeatherInfo = document.getElementById("currentWeatherInfo");
    const futurePredictions = document.getElementById("futurePredictions");

    if (!currentWeatherInfo || !futurePredictions) {
      return;
    }

    currentWeatherInfo.style.display = "block";
    futurePredictions.style.display = "block";
    errorDiv.style.display = "none";

    // Display current weather
    const current = weatherData.current;

    currentWeatherInfo.innerHTML = `
      <p>Temperature: ${current.temperature_2m}°C</p>
      <p>Feels Like: ${current.apparent_temperature}°C</p>
      <p>Humidity: ${current.relative_humidity_2m}%</p>
      <p>Wind Speed: ${current.wind_speed_10m} km/h</p>
      <p>Precipitation: ${current.precipitation} mm</p>
    `;

    const daily = weatherData.daily;

    futurePredictions.innerHTML = daily.time.map(
      (date: string, index: number) => {

        return `
          <div>
            <h3>${date}</h3>
            <p>Maximum: ${daily.temperature_2m_max[index]}°C</p>
            <p>Minimum: ${daily.temperature_2m_min[index]}°C</p>
          </div>
          <hr>
        `;

      }
    ).join("");

  }catch(e){
    console.log(e)
  }
}
