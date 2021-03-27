/**
 * clearNodes
 * utility function to clear all children of a given html element
 * @param {parent} the parent HTML element that will have all its children removed from
 */
 function clearNodes(parent)
 {
     while(parent.firstChild)
     {
         parent.removeChild(parent.firstChild);
     }
     return;
 }

/**
 * requestData
 * takes an api endpoint and requests data and returns response via Promise
 * @param {string} givenURL 
 * @returns Promise - returns promise from fetch request with api data
 */
async function requestData(givenURL)
{
    let response = await fetch(givenURL)
    if(response.ok)
    {
        const data = await response.json();
        return data;
    }
    if(!response.ok)
    {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    else
    {
        return;
    }
}


async function getWeather(givenURL)
{
    let apiData;
    let cityName;

    if(givenURL)
    {
        apiData = await requestData(givenURL);
    }
    else
    {
        $('#invalid-search').modal('show');
    }

    if(apiData)
    {
        cityName = apiData.name;
        const betterURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${apiData.coord.lat}&lon=${apiData.coord.lon}&exclude={minutely,hourly,alerts}&units=imperial&appid=${API_KEY}`
        betterApiData = await requestData(betterURL);
    }

    if(betterApiData)
    {
        updateWeather(betterApiData, cityName);
    }
}

function updateWeather(data, cityName)
{
    $('#city-name').text(cityName + ' - ' + moment().format('L'));
    $('#w-icon').attr('src', `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`);
    $('#city-temp').text(Math.round(data.current.temp) + ' °F');
    $('#city-humi').text(data.current.humidity + ' %');
    $('#city-wind').text(data.current.wind_speed + ' MPH');
    $('#city-uv').text(data.current.uvi);
    if(data.current.uvi <= 2)
    {
        $('#city-uv').addClass('bg-success');
    }
    else if(data.current.uvi > 2 || data.current.uvi <= 5)
    {
        $('#city-uv').addClass('bg-warning');
    }
    else
    {
        $('#city-uv').addClass('bg-danger');
    }

    $('.wc').remove();

    for(let i = 0; i < 5; i++)
    {
        $('#weather-cards').append(
            `<div class="col wc"><div class="card bg-primary text-white"><div class="card-body"><h5 class="card-title">${moment.unix(data.daily[i].dt).format('L')}</h5><img src="http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png" alt="weather icon"><h5 class="card-text">High: ${Math.round(data.daily[i].temp.max)} °F</h5><h5 class="card-text">Low: ${Math.round(data.daily[i].temp.min)} °F</h5><h5 class="card-text">Humidity: ${data.daily[i].humidity}%</h5></div></div></div>`
        );
    }
}


/**
 * parseInput
 * takes a user input and based on the value returns a url to an API endpoint with that input as the search params
 * @param {string} usrInput 
 * @returns String - URL formated correctly for the input the user gave if valid data is given. returns null otherwise
 */
function parseInput(usrInput)
{
    storeLastSearch(usrInput);
    let arrCityData = usrInput.split(',');
    
    
    if(arrCityData[0].match(/\d{5,}/g))
    {
        return `https://api.openweathermap.org/data/2.5/weather?zip=${arrCityData[0]},US&appid=${API_KEY}`;
    }
    else if(arrCityData[0] != '')
    {
        arrCityData.forEach(e => {
            arrCityData[arrCityData.indexOf(e)] = e.trim();
        });
        
        if(arrCityData[1] != "")
        {
            arrCityData[1] = 'US-' + arrCityData[1];
        }
        else if (arrCityData[1] == "")
        {
            for(var i = 1; i < arrCityData.length; i++)
            {
                arrCityData.pop();
            }
        }

        switch(arrCityData.length)
        {
            case(1):
                return `https://api.openweathermap.org/data/2.5/weather?q=${arrCityData[0]}&appid=${API_KEY}`;
            case(2):
                return `https://api.openweathermap.org/data/2.5/weather?q=${arrCityData[0]},${arrCityData[1]}&appid=${API_KEY}`;
            case(3):
                return `https://api.openweathermap.org/data/2.5/weather?q=${arrCityData[0]},${arrCityData[1]},${arrCityData[2]}&appid=${API_KEY}`;
        }
    }

    return;

}

/**
 * getLastSearch
 * gets whatever value is stored in the browsers local storage under the key 'last-search'
 * @returns string - lsSearch, value of local storage key 'last-search' or null if nothing is stored
 */
function getLastSearch()
{
    let lsSearch = localStorage.getItem('last-search');
    return lsSearch != null  ? lsSearch : null;
}

/**
 * storeLastSearch
 * takes a given string and stores it to local storage under the key 'last-search'
 * @param {string} usrSearch 
 */
function storeLastSearch(usrSearch)
{
    localStorage.setItem('last-search', usrSearch);
}

/**
 * Event listener for form submission that passes the input value to the parseInput function
 */
$('.search-form').submit(e => {
    e.preventDefault();
    let inputField = e.target[0];
    getWeather(parseInput(inputField.value));
    inputField.value = '';
});

/**
 * Event listener for the list items in the aside that are quick selections for popular cities
 */
$('ul li').on(
    {
        mouseenter: function() {
            $(this).addClass('active');
        },
        mouseleave: function() {
            $(this).removeClass('active');
        },
        click: function() {
            let searchInput = $(this)[0].firstChild.textContent;
            getWeather(parseInput(searchInput));
        }
    }
);
$(function()
{
    if(getLastSearch() != null)
    {
        getWeather(parseInput(getLastSearch()));
    }
    else
    {
        getWeather(parseInput('Chicago'));
    }
});
