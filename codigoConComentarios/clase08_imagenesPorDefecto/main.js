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

        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src', 
            'https://image.tmdb.org/t/p/w300' + movie.poster_path
        )

        /**
         * N8.1: No todas las películas tienen una imagen del poster para mostrar, por lo que se agrega una solución.
         * Se crea un evento para detectar si se produce un "error" al intentar traer la imagen. (Es el error 404)
         * Se agrega una imagen por defecto (imagen de error de Platzi) directo al contenedor utilizando el método setAttribute()
         */
        /*
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute(
                'src',
                'https://static.platzi.com/static/images/error/img404.png', //ffffff?
                //`https://via.placeholder.com/300x450/5c218a/000000?text=${movie.title}`
            );
        })
        */

        /**
         * N8.3: APORTE COMPAÑEROS: Se crea otra alternativa para que en vez de que aparezca una imagen por defecto de las películas 
         *      sin poster, ahora aparecerá el titulo de la película en grande. De esta forma se puede entrar a ver la información de 
         *      la película, ya que aunque no tenga la fotografía, si cuenta con su información.
         */
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute(
                'src', 
                `https://via.placeholder.com/300x450/5c218a/fff?text=${movie.title}`
            )
        })
        

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });
}