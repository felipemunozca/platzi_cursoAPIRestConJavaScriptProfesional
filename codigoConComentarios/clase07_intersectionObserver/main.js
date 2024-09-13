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

/**
 * N7.1: Se crea una constante para habilitar el uso de lazy loader mediante Intersection Observer.
 * Lazy loading (carga perezosa) se utiliza para no mostrar todas las imágenes al mismo tiempo, sino que solo cargar las que se detecten 
 *      en el viewport del dispositivo y cuando se haga scroll vayan apareciendo las demás imágenes.
 * 
 * N7.2: Documentación oficial
 * https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 * 
 * N7.3: Se debe instanciar un prototipo new IntersectionObserver() y en la documentación se pide utilizar 2 parámetros, el callback y 
 *      las opciones, pero en este caso solo se utilizara el callback que se llamara entries, y no serán necesarias las opciones ya que
 *      esta configuración se utilizara en todo la pagina index.html.
 * UNA BUENA PRACTICA ES: crear un observador por cada distinto contenedor de imágenes.
 * 
 * N7.4: Se utiliza un ciclo forEach() para recorrer cada una de las entradas (cada elemento que se esta observando).
 * 
 * N7.6: Se crea una constante url donde se almacenara la ruta de cada imagen que se esta enviando desde la función createMovies() y 
 *      mediante la propiedad target y el método getAttribute() se define que se obtendrá el valor que se llame "data-img".
 * Luego, utilizando nuevamente la propiedad target, seguido del método setAttribute() se define que el valor de "src" sera el que se
 *      guardo en la constante url.
 * 
 * N7.8: Se utiliza la consola para hacer una prueba si se están obteniendo las propiedades de cada imagen del cartel de la pelicula.
 * Se hace uso de una validación if() para preguntar SI en cada entrada esta activa la propiedad isIntersecting (que es parte de las
 *      propiedades que se habilitaron gracias al intersection observer). Si la imagen aparece dentro del layout del contenedor, la
 *      ruta de la imagen se envía para que sea agregada en su respectivo contenedor.
 * Para probar como funciona, en el navegador, abrir el proyecto, clic derecho, inspeccionar, seleccionar la pestaña "red". Luego hacer
 *      pruebas moviendo el scroll de películas en tendencia.
 */
const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        // console.log(entry.target.setAttribute)
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img')
            entry.target.setAttribute('src', url);
            /**
             * N7.13: APORTE COMPAÑEROS: Si las imágenes ya están cargadas ya no es necesario utilizar el observer.
             * Se agrega el método unobserve() para ignorar las imágenes que ya han sido cargadas dentro de su contenedor.
             */
            lazyLoader.unobserve(entry.target)
        }
    });
});

/**
 * N7.9: Si queremos habilitar o no, el uso de lazy loader de las imágenes en todo el sitio, se puede crear una nueva propiedad
 *      para definir donde sera utilizado o no.
 * Se agrega el parámetro lazyLoad que por defecto tendrá el valor de false.
 */
function createMovies(movies, container, lazyLoad = false) {
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        movieContainer.addEventListener('click', () => {
            location.hash = '#movie=' + movie.id;
        });

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        /**
         * N7.5: Se edita la parte del código que agrega las imágenes como parte del fondo del contenedor.
         * Se agrega la propiedad data-img que se estará enviando hacia la función lazyLoader.
         * 
         * N7.11: Si lazyLoad es igual a true, que agregue la imagen a data-img SINO que la agregue a src.
         */
        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src', 
            'https://image.tmdb.org/t/p/w300' + movie.poster_path
        )
        // movieImg.setAttribute('src', 'https://image.tmdb.org/t/p/w300' + movie.poster_path);

        /**
         * N7.7: Por cada una de las películas que este agregando en la vista html, se ejecutara la función lazyLoader.
         * Se declara junto al método observe() que estará observando cada vez que se agregue una imagen en la vista.
         * 
         * N7.10: Se crea una validación para preguntar si el valor del parámetro lazyLoad es true (no es necesario agregar == true). 
         * Si se cumple la condición, se ejecuta el código de la función lazyLoader.
         */
        //lazyLoader.observe(movieImg)
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
     * N7.12: Se agrega el valor true, para que se ejecute la función lazyLoader para solo mostrar las imágenes que están dentro de
     *      la vista en su contenedor.
     * En caso de no agregar nada, se cargaran todas las imágenes a la vez.
     */
    createMovies(movies, trendingMoviesPreviewList, true);
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
     * N7.15: Se agrega el valor de true para habilitar el uso de la función lazyLoader.
     */
    createMovies(movies, genericSection, true);
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
        createMovies(movies, genericSection, true);
    }
}

async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;

    createMovies(movies, genericSection, true);
}

async function getMovieById(id) {
    const { data: movie } = await api('movie/' + id);

    const movieDetailImg = document.querySelector('.movieDetail-section--left');
    const movieDetailCategories = document.querySelector('.movieDetail--categories-list');

    /**
     * N7.16 : Se limpia la vista del contenedor para quitar la animación del skeleton.
     */
    movieDetailImg.innerHTML = "";

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    // console.log(movieImgUrl)
    // headerSection.style.background
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
    
    createMovies(relatedMovies, relatedMoviesContainer, true);
    
}