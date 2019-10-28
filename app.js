const searchInput = document.querySelector('.search__input');
const submitButton = document.querySelector('.search__submit');
const noResultLabel = document.querySelector('.no-result');

const statusFilter = document.querySelector('.status-filter');
const releaseFilter = document.querySelector('.release-filter');
const sortByRating = document.querySelector('.rating');
const seriesContainer = document.querySelector('#result');
const sortList = document.querySelectorAll('.sort_list li a');
const reverseList = document.querySelectorAll('.sort-reverse');



let allSeries = [];
let filteredList = [];
let lastItem = 0;
let pageOffset = 12;
let filterActive = false;

const hasQuery = () => searchInput.value != "";

const onSearch = () => {
    if (hasQuery()) {
        searchQuery()
    } else {
        getAllSeries()
    }
}
//image, title, status, relaseDate, rating, desc, i
const transformResponse = show => {
    const average = (show.rating.average) == null ? 0.0 : show.rating.average;
    return {
        image: show.image.original,
        title: show.name,
        status: show.status,
        relaseDate: show.premiered,
        rating: parseFloat(average).toFixed(1),
        desc: show.summary
    };


}
const searchQuery = () => {
    allSeries = [];

    fetch(`http://api.tvmaze.com/search/shows?q=${searchInput.value}`)
        .then(response => response.json())
        .then(response => {

            allSeries = response.map(item => transformResponse(item.show))
        }).then(_ => {
            displayAllSeries(true);
            getOldestAndNewestReleaseYear()
            window.scrollTo({ top: window.innerHeight / 2, behavior: 'smooth' })
        })
}

//FIltrować przy wyświetlaniu

const getAllSeries = () => {
    allSeries = [];
    fetch(`http://api.tvmaze.com/shows`)


        .then(response => response.json())
        .then(response => {
            allSeries = response.map(item => transformResponse(item))

        })
        .then(_ => {
            displayAllSeries(true)
            getOldestAndNewestReleaseYear()
        })
}

function displayAllSeries(displayFromFirst) {

    (displayFromFirst) ? lastItem = 0 : '';
    (lastItem == 0) ? seriesContainer.innerHTML = "" : '';

    const seriesToShow = (!filterActive) ? allSeries : filteredList;
    const lastPageItem = (lastItem + pageOffset <= seriesToShow.length) ? lastItem + pageOffset : seriesToShow.length;

    for (lastItem; lastItem < lastPageItem; lastItem++) {

        displayItem(seriesToShow[lastItem])

    }

    if (seriesToShow.length == 0 || lastItem == seriesToShow.length) {
        noResultLabel.classList.add('no-result--is-active');
    } else {
        noResultLabel.classList.remove('no-result--is-active');
    }
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
    displayAllSeries(false);
}

// SORT AND FILTER

//STATUS FILTER
statusFilter.onchange = (e) => {
    filteredList = [];
    if (e.target.checked) {
        filterActive = true;
        allSeries.forEach(item => { if (item.status.toLowerCase() == "running") filteredList.push(item) })
    } else {
        filterActive = false;
    }
    displayAllSeries(true)
}

// RELASE YEAR
releaseFilter.onchange = (e) => {
    let fromValue = 2012;
    let toValue = 2015;
    let arrayToFilter = (!filterActive) ? allSeries : filteredList;
    let filtered = [];
    if (e.target.checked) {
        arrayToFilter.forEach(item => {
            const year = parseInt(item.premiered.substring(0, 4));
            if (year >= fromValue && year <= toValue) filtered.push(item);
        })
        filterActive = true;
    } else {
        filterActive = false;
    }

    filteredList = filtered;
    displayAllSeries(true);

}


const sortSeriesList = (e) => {
    e.preventDefault();
    const sortOption = e.target.dataset.sort

    const seriesToShow = (!filterActive) ? allSeries : filteredList;

    seriesToShow.sort(sortByProperty(sortOption));
    displayAllSeries(true);
}
const reverseSeriesList = (e) => {
    const seriesToShow = (!filterActive) ? allSeries : filteredList;
    seriesToShow.reverse();
    displayAllSeries(true);
}

sortList.forEach(item => {
    item.addEventListener('click', sortSeriesList);
})

reverseList.forEach(item => {
    item.addEventListener('click', reverseSeriesList);
})
const sortByProperty = (property) => {
    return (x, y) => {
        return ((x[property] === y[property]) ? 0 : ((x[property] < y[property]) ? 1 : -1));
    }
};

const getOldestAndNewestReleaseYear = () => {
    // let arr = allSeries.map(year => parseInt(year.premiered.substring(0,4)));
    // let oldestReleaseYear = Math.min(...arr);
    // let newestRelaseYear = Math.max(...arr);
    // console.log(oldestReleaseYear)
    // console.log(newestRelaseYear)
}

// Print one series item
function displayItem(item) {
    let { image, title, status, relaseDate, rating, desc } = item;

    image = (image) ? image : "https://picsum.photos/350/550/"


    let output = `<div class="item" data-series="">`;
    output += `<div class="item__image"><img src="${image}" role="presentation" /></div>`;
    output += `<div class="item__status ${(status == 'Running') ? 'item__status--is-active' : ''}"><span>${status}</span></div>`;
    output += `<div class="item__rating"><span>${rating}</span></div>`;
    output += `<div class="item__title"><h2>${title}</h2></div>`;
    output += `<div class="item__relase"><span>${relaseDate}</span></div>`;
    output += `<div class="item__desc"><p>${getDescription(item)}</p></div>`;
    output += '</div>';

    seriesContainer.innerHTML += output;
}

submitButton.addEventListener('click', onSearch);
document.addEventListener('scroll', lazyLoadNextSeries);
document.onload = getAllSeries();

// SOON MODAL 
seriesContainer.addEventListener('click', function (e) {
    console.log(e.path[2].dataset.series)
});

const stripHtmlTags = html => html.replace(/(<([^>]+)>)/ig, "")

const getDescription = ({ desc }) => {
    if (desc) {
        const stripedText = stripHtmlTags(desc)
        return stripedText.length > 100 ?
            stripedText.substring(0, 97) + "..." : stripedText;
    } else {
        return "No description to show...";
    }

};