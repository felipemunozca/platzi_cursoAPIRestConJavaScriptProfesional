// const API_KEY = 'a2a87dc7441739d3da15fd4828a001b7';

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY,
        'language': 'es',
    }
});

// Utils

const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img')
            entry.target.setAttribute('src', url);
            lazyLoader.unobserve(entry.target)
        }
    });
});

/**
 * N10.6: Cada vez que se esta llamando a la función createMovies() se limpia todo el contenido, lo que esta bien, pero pero para 
 *      hacer una paginación que cargue las nuevas películas debajo de las que ya se cargaron, se debe crear un cambio en la lógica.
 * Lo primero sera crear una validación, se crea la variable "clean" que si es igual a "true", el contenido del contenedor se debe 
 *      limpiar (no es necesario agregar el == true ya que javascript entiende que es el valor por defecto de una variable que no 
 *      ha sido inicializada).
 * Como parámetro se debería agregar el valor de clean = true ya que este sera el valor por defecto, pero no se ve muy limpio tanto 
 *      parámetro porque cuando se llame esta función se deberá agregar un "true" en caso de utilizar lazy loading y ahora un true o 
 *      false si se quiere limpiar el contenedor. Por lo que una forma de hacerlo mucho mas eficiente es convertir estos parámetros 
 *      en un nuevo objeto y asi poder llamar a la función e indicar de mejor manera que valor booleano se le dará.
 * IMPORTANTE: agregar al final el valor de "={}" igual a objeto vació en el caso de no enviar nada y asi evitar errores.
 */
function createMovies(movies, container, { lazyLoad = false, clean = true } = {}) {
    if (clean) {
        container.innerHTML = '';
    }
    // container.innerHTML = '';

    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        movieContainer.addEventListener('click', () => {
            location.hash = '#movie=' + movie.id;
        });

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);

        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src', 
            'https://image.tmdb.org/t/p/w300' + movie.poster_path
        )

        movieImg.addEventListener('error', () => {
            movieImg.setAttribute(
                'src',
                // N10.18: 
                // La URL "placeholder.com" ya no existe, fue vendida a una empresa por tener el mismo nombre, por lo que se 
                // reemplaza por otra.
                //`https://via.placeholder.com/300x450/5c218a/fff?text=${movie.title}` 
                `https://placehold.co/300x450?text=${movie.title}`,
            )
        })
        

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });
}

function createCategories(categories, container) {
    container.innerHTML = "";

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });
        
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;

    /**
     * N10.7: Con el cambio que se hizo a la función createMovies() ahora se agrega el objeto para poder utilizar lazyLoad y si 
     *      quiero que limpie o no el contenido.
     * La primera vez, SI QUIERO que me limpie la vista para que asi quite las tarjetas creadas para mostrar en caso de no tener 
     *      contacto con la API, por lo que se le agrega en valor de true a clean.
     * Esto se debe repetir con todas las vistas que tengan contenedores con la animación de carga.
     */
    createMovies(movies, trendingMoviesPreviewList, { lazyLoad: true, clean: true });
    // createMovies(movies, trendingMoviesPreviewList, true);
}

async function getCategoriesPreview() {
    const { data } = await api('genre/movie/list');
    const categories = data.genres;

    createCategories(categories, categoriesPreviewList)  ;
}

async function getMoviesByCategory(id) {
    const { data } = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;

    /**
     * N10.8: Se actualiza el uso de la función createMovies()
     */
    createMovies(movies, genericSection, {lazyLoad: true});
    // createMovies(movies, genericSection, true);
}

async function getMoviesBySearch(query) {
    const { data } = await api('search/movie', {
        params: {
            query,
        },
    });
    const movies = data.results;

    genericSection.innerHTML = '';

    if (movies.length == 0) {
        errorMessageSearch.classList.remove('inactive');
        errorMessageSearch.innerHTML = `
            <p><strong>Error</strong></p>
            <p>No se encontró ninguna película con la palabra "<strong>${query}</strong>".</p>
            <p>Revise que el nombre este bien escrito y vuelva a intentarlo.</p>
        `;
        //alert('Arreglo vació');
        return;
    } else {
        errorMessageSearch.classList.add('inactive');
        /**
         * N10.9: Se actualiza el uso de la función createMovies()
         */
        createMovies(movies, genericSection, {lazyLoad: true});
        // createMovies(movies, genericSection, true);
    }
}

async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;

    /**
     * N10.10: Se actualiza el uso de la función createMovies()
     */
    createMovies(movies, genericSection, {lazyLoad: true, clean: true});
    // createMovies(movies, genericSection, true);

    /**
     * N10.1: Lo que haremos en esta clase, en la sección de películas en tendencia, se agregara un botón y al presionarlo se 
     *      llamara a la siguiente "paginación" y traerá la siguiente lista de películas.
     * 
     * N10.2: Se crea un nuevo elemento de tipo botón desde JavaScript. Se le agrega un texto para mostrar y luego se inyecta 
     *      dentro de la sección de "Top 20 películas en Tendencias".
     * PD: No le daremos mucha lógica, ya que en la siguiente clase se eliminara para pasar a utilizar infinite scroll.
     * 
     * N10.3: A nuestro nuevo botón se le debe agregar en evento que escuche el clic y se le asigna una nueva función que debemos 
     *      crear.
     * NOTA: Se debe agregar antes de appendChild() para que la función se lea antes de imprimir en la vista.
     */
    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText = "Cargar más";
    btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
    genericSection.appendChild(btnLoadMore);

}

/**
 * N10.13: En el caso de querer seguir cargando películas y pasar de la pagina 2 a la 3 y sucesivamente, se crea una nueva 
 *      variable para almacenar el valor de la pagina con su valor inicial en 1.
 */
let page = 1;

/**
 * N10.4: Se crea la nueva función para obtener la paginación desde la API.
 */
async function getPaginatedTrendingMovies() {
    /**
     * N10.5: Se utiliza el mismo endpoint, y utilizando los query parameters gracias a la ayuda de axios, se crea un objeto para 
     *      enviar información, en este caso, el numero de la pagina que quiero traer que sera la 2.
     * Si todo resulto bien, se puede hacer la prueba presionando el botón y debería cambiar la lista de películas (de la 21 a la 40).
     * 
     * N10.14: Ahora cada vez que se ejecute este función el valor de page subirá en UNO y ese sera el valor de la pagina que se 
     *      solicitara.
     */
    page++;
    const { data } = await api('trending/movie/day', {
        params: {
            // page: 2
            page
        }
    });
    const movies = data.results;

    /**
     * N10.11: Se actualiza el uso de la función createMovies()
     * En el caso de esta función el valor de clean sera falso, ya que no quiero que me borre la primera lista de películas, sino 
     *      que las nuevas se agreguen debajo de las ya existentes.
     */
    createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    // createMovies(movies, genericSection, true);

    /**
     * N10.15: Ahora copio y pego el código para crear un nuevo botón y asi poder continuar ejecutando la función para seguir 
     *      llamando a la paginación de películas.
     */
    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText = "Cargar más";
    btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
    genericSection.appendChild(btnLoadMore);
}

/**
 * N10.19: Esta es la solución de un compañero.
 * Creo todo el código visto en esta clase, en una sola función que la hace mas fácil de entender y de ejecutar.
 */
/*
async function getTrendingMovies(page = 1){
    const { data } = await api('/trending/movie/day', {
        params: {
            page,
        }
    });

    const movies = data.results;

    movieContainer(movies, genericSection, { lazy: true, clean: page == 1 });

    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText = "Load more";
    btnLoadMore.addEventListener('click', () => {
        btnLoadMore.style.display = 'none';
        getTrendingMovies(page + 1);
    });

    genericSection.appendChild(btnLoadMore); 
}
*/
async function getMovieById(id) {
    const { data: movie } = await api('movie/' + id);

    const movieDetailImg = document.querySelector('.movieDetail-section--left');
    const movieDetailCategories = document.querySelector('.movieDetail--categories-list');

    movieDetailImg.innerHTML = "";

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    /*
    movieDetailImg.style.background = `
        linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%),
        url(${movieImgUrl})
    `;
    */

    movieDetailImg.style.backgroundImage  = `url(${movieImgUrl})`;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;
    
    createCategories(movie.genres, movieDetailCategories);

    getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
    const { data } = await api(`movie/${id}/recommendations`);
    const relatedMovies = data.results;
    
    /**
     * N10.12: Se actualiza el uso de la función createMovies()
     */
    createMovies(relatedMovies, genericSection, {lazyLoad: true});
    // createMovies(relatedMovies, relatedMoviesContainer, true);
}