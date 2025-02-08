/**
 * N11.8: Se crea la variable para comenzar la paginación en la pagina 1.
 * Se crea una nueva variable que llamara infiniteScroll y como indica el nombre, se ejecutara cada vez que se quieran cargar 
 *      mas películas. La variable no tendrá valor ya que este se obtendrá cuando se ejecute un llamado de las funciones que se 
 *      llamen "paginated" y asi se obtendrá un valor dinámico y re-utilizable.
 */
let page = 1;
let infiniteScroll;

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
/**
 * N11.9: Se crea el escuchador de eventos que estará escuchando al "scroll" y se ejecutara cada vez que se llame en diferentes 
 *      secciones de nuestra pagina.
 */
window.addEventListener('scroll', infiniteScroll, false);

function navigator() {
    /**
     * N11.11: Si se ejecuta el código como esta hasta el punto 11.10 no sucederá nada, esto se debe a que la variable 
     *      infiniteScroll NO TIENE ningún valor cuando se declaro, y no se entera nunca que se le ha asignado un nuevo valor en 
     *      la función trendsPage(), por lo que se debe crear una validación.
     * Si infiniteScroll tiene algún valor, el que sea, se utiliza la propiedad removeEventListener() para quitar el evento "scroll" 
     *      y ya no sera igual a la variable infiniteScroll.
     * Luego se le asigna el valor de indefinido a la variable infiniteScroll. ¿Por que se debe asignar el valor de undefined? eso 
     *      se debe a que como sera una valor dinámico, cada vez que se ejecute la función navigator() podamos quitar ese evento y 
     *      luego cambiarlo. Asi cada vez que se llame a cada uno de los hash, se le estará asignando un valor a infiniteScroll.
     * 
     * N11.13: Dentro del evento se agrega un tercer parámetro que se declara como un objeto.
     * Passive lo que hace es evitar el llamado de preventDefault() en el caso de que este existiese en la función llamada por el 
     *      Listener. En los navegadores que usa la gente normal el valor por defecto es false por lo que no siempre se utiliza, 
     *      pero en el caso de "Safari" e "Internet Explorer" el valor por defecto es true. Por lo que es recomendable ponerle un 
     *      valor para que el código se ejecute igual en todos los navegadores.
     */
    if (infiniteScroll) {
        window.removeEventListener('scroll', infiniteScroll, { passive: false });
        infiniteScroll = undefined;
    }

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

    /**
     * N11.12: Para complementar la lógica del punto 11.11 se crea una nueva validación.
     * SI infiniteScroll tiene algún valor, se utiliza la propiedad addEventListener() para agregar el evento "scroll" y se le 
     *      asigna ese valor a infiniteScroll.
     * EN RESUMEN: el primer if() quita el evento scroll, luego se cambia la vista utilizando los hash y el segundo if() agrega 
     *      el evento scroll.
     */
    if (infiniteScroll) {
        window.addEventListener('scroll', infiniteScroll, { passive: false });
    }
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

    /**
     * N11.10: Se le asigna el valor de la función getPaginatedTrendingMovies() a la variable infiniteScroll, pero 
     *      MUY IMPORTANTE no se le agregan los paréntesis () para que la función no se ejecute al cargar, sino que se ejecutara 
     *      cuando se ejecute el evento scroll y llegue al final de la pagina.
     */
    infiniteScroll = getPaginatedTrendingMovies;
}