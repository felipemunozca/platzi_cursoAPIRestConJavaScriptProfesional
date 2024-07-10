searchFormBtn.addEventListener('click', () => {

    if (searchFormInput.value == "") {
        errorMessageInput.classList.remove('inactive');
        errorMessageInput.innerHTML = `
            <p><strong>Error</strong></p>
            <p>Debe ingresar un nombre antes de presionar el botón</p>`;
        return;
    }

    location.hash = '#search=' + searchFormInput.value;
});

trendingBtn.addEventListener('click', () => {
    location.hash = '#trends';
});

let historial = [];

arrowBtn.addEventListener('click', () => {
    historial.pop()
    
    if (historial.length > 0) {
        location.hash = '#search=' + historial[historial.length - 1]
    } else {
        location.hash = '#home'
    }
})

window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);

function navigator() {
    if (location.hash.startsWith('#trends')) {
        trendsPage();
    } else if (location.hash.startsWith('#search=')) {
        searchPage();
    } else if (location.hash.startsWith('#movie=')) {
        movieDetailsPage();
    } else if (location.hash.startsWith('#category=')) {
        categoriesPage();
    } else {
        homePage();
    }

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}


function homePage() {
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';  //Limpiar el background
    arrowBtn.classList.add('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.remove('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.remove('inactive');
    categoriesPreviewSection.classList.remove('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.add('inactive');

    // Limpiar los mensajes de error
    errorMessageInput.classList.add('inactive');
    errorMessageSearch.classList.add('inactive');

    getTrendingMoviesPreview();
    getCategoriesPreview();
}

function categoriesPage() {
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    // Limpiar los mensajes de error
    errorMessageInput.classList.add('inactive');
    errorMessageSearch.classList.add('inactive');

    const [_, categoryData] = location.hash.split('='); // ['url#category', 'id-name']
    const [categoryId, categoryName] = categoryData.split('-'); //['id', 'name']

    headerCategoryTitle.innerHTML = decodeURI(categoryName);
    getMoviesByCategory(categoryId);
}

function movieDetailsPage() {
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.remove('inactive');

    // Limpiar los mensajes de error
    errorMessageInput.classList.add('inactive');
    errorMessageSearch.classList.add('inactive');

    const [_, movieId] = location.hash.split('='); // ['url#movie', 'id']
    getMovieById(movieId);
}

function searchPage() {
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    // Limpiar los mensajes de error
    errorMessageInput.classList.add('inactive');
    /* errorMessageSearch.classList.add('inactive'); */

    const [_, query] = location.hash.split('='); // ['url#search', 'id-name']
    getMoviesBySearch(query);
}

function trendsPage() {
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    // Limpiar los mensajes de error
    errorMessageInput.classList.add('inactive');
    errorMessageSearch.classList.add('inactive');

    headerCategoryTitle.innerHTML = 'Top 20 películas en Tendencias'; //Tendencias
    getTrendingMovies();
}