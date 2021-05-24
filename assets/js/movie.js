const movieName = document.getElementById('movie-name');
const movieDescription = document.getElementById('movie-description');
const movieRating = document.getElementById('rating-info');
const movieYear = document.getElementById('release-year');
const movieCast = document.getElementById('movie-cast');
const movieBanner = document.getElementById('movie-banner');


let id = new URL(window.location.href).searchParams.get('id');
console.log(id);


fetch("http://localhost:9200/movies/_doc/"+id)
    .then(res => res.json())
    .then(
        data => {
            console.log(data._source);
            movieName.innerHTML = data._source.name;
            movieDescription.innerHTML = data._source.description;
            movieRating.innerHTML = data._source.rating;
            data._source.actors.forEach(actor => {
                movieCast.innerHTML += `
                <div class="actor d-flex align-items-center pb-2 m-2">
                    <img src="assets/img/logo.png" class="actor-img rounded-circle mr-2 border border-dashed" alt="">
                    <b>${actor}</b>
                </div>`
            });
            movieYear.innerHTML = data._source.releaseYear;
            let img = "url('assets/img/movies/"+id+"')";
            console.log(img);
            movieBanner.style.background = img;
            movieBanner.style.backgroundSize = "cover";
            movieBanner.style.backgroundPosition = "center";
                        
    })
        