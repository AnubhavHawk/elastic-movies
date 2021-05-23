const movieContainer = document.getElementById('movie-container');
const tagContainer = document.getElementById('tag-container');

var tagPayload = {
    // _source: "tags"
}

let tags = new Set(); // only unique
let movies = [];
// Get all the tags available
fetch("http://localhost:9200/movies/_search", {
    method: 'POST',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(tagPayload)
})
.then(res => res.json())
.then(
    data => {
        let itemList = data.hits.hits
        itemList.forEach(element => {
            element._source.tags.forEach(t => tags.add(t))
            movies.push(element._source);
        });
        var tagHTML = "";
        console.log(tags)
        if(tags.size > 0){
            tags.forEach(element => {
                tagHTML += `<span class="bg-e-blue text-white mr-2 pl-2 pr-2 m-1 text-capitalize tag rounded"><a href="search.php?tag=${element}" class="text-white">${element}</a></span>`;
            });
        }
        else{
            tagHTML = "<b class='p-4 text-center'>No Tags Available</b>"
        }
        tagContainer.innerHTML = tagHTML;


        // ---------------- Movies
        
        // Display movies
        let movieHTML = ``;
        movies.forEach(movie => {
            console.log(movie);
            movieHTML += `
            <div class="movie-card p-3">
                <div class="card">
                    <div style="background:url('assets/img/movies/${movie.img}'); height:150px; background-position: center;background-size:cover;"></div>
                    <div class="card-body">
                    <h4 class="card-title font-weight-bold">${movie.name}</h4>
                    <p class="card-text text-truncate">${movie.description}</p>
                    <a href="movie?id=${movie.id}" class="text-e-blue">View details</a>
                    </div>
                </div>
            </div>`;
        })
        movieContainer.innerHTML = movieHTML;
    }
)