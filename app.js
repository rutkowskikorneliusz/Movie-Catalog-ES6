const searchInput = document.querySelector('.search__input');
const submitButton = document.querySelector('.search__submit');
const noResultLabel = document.querySelector('.no-result');
const seriesContainer = document.querySelector('#result');

// Filter handlers
const seriesStatusFilter = document.querySelector('.status-filter');
const oldestValueSelect= document.querySelector('.oldestValue');
const newestValueSelect = document.querySelector('.newestValue');

// Sort handlers
const sortList = document.querySelectorAll('.sort_list li a');
const reverseList = document.querySelectorAll('.sort-reverse');

// All data geted from API
let allSeries = [];

// Pagination variables
let lastItem = 0;
let pageOffset = 12;

// Filter variables
let isStateFilterActive = false;
let fromYearFilterValue = 0;
let toYearFilterValue = 0


// Get search query data
const searchQuery = () => {
    fetch(`http://api.tvmaze.com/search/shows?q=${searchInput.value}`)
        .then(response => response.json())
        .then(response => {
            allSeries = [];
            allSeries = response.map(item => transformResponse(item.show))
        }).then(_ => {
            getOldestAndNewestReleaseYear()
            setYearFilterValue();
            displaySeries(false);
            window.scrollTo({ top: window.innerHeight / 2, behavior: 'smooth' })
        })
}
// Get all series data
const allSeriesQuery = () => {
    fetch(`http://api.tvmaze.com/shows`)
        .then(response => response.json())
        .then(response => {
            allSeries = [];
            allSeries = response.map(item => transformResponse(item))
        })
        .then(_ => {
            getOldestAndNewestReleaseYear()
            setYearFilterValue();
            displaySeries(false);
        })
}

const lazyLoadNextSeries = () => {
    const body = document.body;
    const html = document.documentElement;
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const documentHeight = Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    if (scrollTop < documentHeight - window.innerHeight) return;
    displaySeries(true);
}

const displaySeries = (loadMore) => {
    if (!loadMore) {
        lastItem = 0;
        seriesContainer.innerHTML = "";
    }
    const seriesToShow = allSeries.filter(releaseDateFilter).filter(stateFilter);
    const lastPageItem = (lastItem + pageOffset <= seriesToShow.length) ? lastItem + pageOffset : seriesToShow.length

    for (lastItem; lastItem < lastPageItem; lastItem++) {
        displayItem(seriesToShow[lastItem])
    }
    showNoResultBar(seriesToShow.length)
}

const showNoResultBar = (length) => {
    if (length == 0 || lastItem == length) {
        noResultLabel.classList.add('no-result--is-active');
    } else {
        noResultLabel.classList.remove('no-result--is-active');
    }
}
// Print one series item
function displayItem(item) {
    let { id, image, title, status, relaseDate, rating, desc } = item;
    image = (image) ? image : "https://picsum.photos/350/550/";

    console.log(getDescription(desc))
    let output = `<div class="item" data-series="${id}">`;
    output += `<div class="item__image"><img src="${image}" role="presentation" /></div>`;
    output += `<div class="item__status ${(status == 'Running') ? 'item__status--is-active' : ''}"><span>${status}</span></div>`;
    output += `<div class="item__rating"><span>${rating}</span></div>`;
    output += `<div class="item__title"><h2>${title}</h2></div>`;
    output += `<div class="item__relase"><span>${relaseDate}</span></div>`;
    output += `<div class="item__desc"><p>${getDescription(desc)}</p></div>`;
    output += '</div>';
    seriesContainer.innerHTML += output;
}


// FILTERS

const stateFilter = item => isStateFilterActive ? item.status === "Running" : true;

const releaseDateFilter = item => {
    const year = parseInt(item.relaseDate.substring(0, 4));
    return year >= fromYearFilterValue && year <= toYearFilterValue
}

// Check filters update
seriesStatusFilter.onchange = (e) => {
    isStateFilterActive = e.target.checked ? true : false;
    displaySeries(false);
}
oldestValueSelect.onchange = (e) => {
    fromYearFilterValue = e.target.value;
    displaySeries(false);
}
newestValueSelect.onchange = (e) => {
    toYearFilterValue = e.target.value;
    displaySeries(false);
}

// SORT

const sortSeriesList = (e) => {
    e.preventDefault();
    const sortOption = e.target.dataset.sort
    allSeries.sort(sortByProperty(sortOption));
    displaySeries(false);
}
const reverseSeriesList = () => {
    allSeries.reverse();
    displaySeries(false);
}

const sortByProperty = (property) => {
    return (x, y) => {
        return ((x[property] === y[property]) ? 0 : ((x[property] < y[property]) ? 1 : -1));
    }
};

// Add event listner to sort button's
sortList.forEach(item => {
    item.addEventListener('click', sortSeriesList);
})

reverseList.forEach(item => {
    item.addEventListener('click', reverseSeriesList);
})

// HELPERS

const onSearch = () => { hasQuery() ? searchQuery() : allSeriesQuery() }
const hasQuery = () => searchInput.value != "";


const stripHtmlTags = html => html.replace(/(<([^>]+)>)/ig, "");

const getDescription = desc => { 
    if (desc.length > 100) {
        return desc.substring(0, 100)
    } 
    return desc   
};



const getOldestAndNewestReleaseYear = () => {
    let arr = allSeries.map(item => parseInt(item.relaseDate.substring(0, 4)));
    fromYearFilterValue = Math.min(...arr);
    toYearFilterValue = Math.max(...arr);
}

const setYearFilterValue = () => {
    oldestValueSelect.innerHTML = '';
    newestValueSelect.innerHTML = '';
    for(let date=fromYearFilterValue; date <= toYearFilterValue; date++) {
        oldestValueSelect.innerHTML += `<option>${date}</option>`
    }
    for(let date=toYearFilterValue; date >= fromYearFilterValue; date--) {
        newestValueSelect.innerHTML += `<option>${date}</option>`
    }
}


const transformResponse = show => {
    const average = (show.rating.average) == null ? 0.0 : show.rating.average;
    const description = (show.summary) ? stripHtmlTags(show.summary) : "No description to display..";
    return {
        id: show.externals.thetvdb,
        image: show.image.original,
        title: show.name,
        status: show.status,
        relaseDate: show.premiered,
        rating: parseFloat(average).toFixed(1),
        desc: description
    }
}



// const getDescription = (desc) => {
//     if (desc.length > 100) {
//         return desc.substring(0, 100)
//     } else {
//         return desc
//     }
// };
// SOON MODAL 
seriesContainer.addEventListener('click', function (e) {
    console.log(e.path[2].dataset.series)
});


document.onload = allSeriesQuery();
document.addEventListener('scroll', lazyLoadNextSeries);
submitButton.addEventListener('click', onSearch);

