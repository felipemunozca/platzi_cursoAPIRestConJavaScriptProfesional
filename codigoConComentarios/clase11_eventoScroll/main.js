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

function createMovies(movies, container, { lazyLoad = false, clean = true } = {}) {
    if (clean) {
        container.innerHTML = '';
    }

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

    createMovies(movies, trendingMoviesPreviewList, { lazyLoad: true, clean: true });
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

    createMovies(movies, genericSection, {lazyLoad: true});
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
        createMovies(movies, genericSection, {lazyLoad: true});
    }
}

async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;

    createMovies(movies, genericSection, {lazyLoad: true, clean: true});

    /**
     * N11.6: Se quita el botón para "Cargar más" películas, ya que ahora se hará mediante un evento.
     */
    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = "Cargar más";
    // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
    // genericSection.appendChild(btnLoadMore);
}

/**
 * N11.5: De forma momentánea, se crea un escuchador de eventos que estará atento al scroll y asi poder ejecutar la función para 
 *      paginar las películas y asi probar si el código quedo bien creado.
 * Recordar que antes la función se ejecutaba al presionar un botón, ese botón se eliminara.
 * 
 * N11.7: Para crear un código mas optimo, se creara una nueva forma de llamar la función getPaginatedTrendingMovies() dentro del 
 *      archivo navigation.js por lo que este evento scroll quedara comentado.
 */
// let page = 1;
// window.addEventListener('scroll', getPaginatedTrendingMovies);

async function getPaginatedTrendingMovies() {
    /**
     * N11.1: En esta clase se continuara con el desarrollo del scroll infinito, lo primero sera comprender los siguientes términos.
     * Dentro de la consola del navegador, se puede utilizar la propiedad "document.documentElement." para obtener los siguientes 
     *      valores:
     * - scrollTop: es la propiedad que nos dice cuanto scroll hemos hecho en la pantalla.
     * - clientHeight: es la propiedad para obtener el alto del dispositivo en pixeles.
     * - scrollHeight: es cuanto scroll se puede hacer en esa pantalla (la suma de las dos propiedades anteriores).
     * 
     * N11.2: se crea una constate y se desestructuran todo lo que venga de document.documentElement.
     * Asi obtendremos los valores de scrollTop, scrollHeight y clientHeight.
     */
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    /**
     * N11.3: Se crea una nueva constante para almacenar el valor si se llega al final de la pantalla.
     * Se toma el valor del scroll y se le suma el tamaño de la pantalla, si es mayor o igual al scroll máximo que se puede hacer 
     *      se guardara un valor "true" o "false".
     * Llegar al fondo o footer de la pagina es muy complicado, por lo que un truco que se puede hacer, es restarle una cantidad de 
     *      pixeles para que asi si se pueda llegar al fondo, en este caso se le restan 15 pixeles del fondo (pueden ser mas o menos,
     *      dependerá de que se esta desarrollando y de la interacción que se busca obtener del usuario).
     */
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);

    /**
     * N11.4: Se crea una validación. Si scrollIsBottom es igual a "true" se ejecuta el código para llamar a la siguiente pagina de 
     *      películas.
     * No es necesario agregar el valor "== true" ya que por defecto, los valores de las variables son true, no es necesario pedir 
     *      una confirmación.
     */
    if (scrollIsBottom) {
        page++;
        const { data } = await api('trending/movie/day', {
            params: {
                page,
            },
        });
        const movies = data.results;

        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
}

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
    
    createMovies(relatedMovies, genericSection, {lazyLoad: true});
}