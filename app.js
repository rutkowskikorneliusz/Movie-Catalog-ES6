const searchInput = document.querySelector('.search__input');
const submitButton = document.querySelector('.search__submit');

const seriesContainer = document.querySelector('#series');

let allSeries = [];

function getDataFromApi() {

    fetch(`http://api.tvmaze.com/search/shows?q=${searchInput.value}`)
    .then(response => response.json())
    .then(response => {
        console.log(response);
    })
    
}
function displaySeriesBox(image, title, status, relaseDate, rating, desc) {

    let output = '<div class="series__item">';
        output += '' 
}

submitButton.addEventListener('click', getDataFromApi);