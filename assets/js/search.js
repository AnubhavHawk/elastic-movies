const tagsToggle = document.getElementById('toggle-tags');
const tagsInfo = document.getElementById('tags-info');
const yearSlider = document.getElementById('year');
const yearValue = document.getElementById('year-value');
const keywordBlock = document.getElementById('keyword');
const tagSearch = document.getElementById('tag-search');
const tagSuggestionBlock = document.getElementById('tag-suggestion');
const tagsBox = document.getElementById('tags-box');
const tagAddBtn = document.getElementById('tag-add-btn');
const searchBtn = document.getElementById('search-btn');
const minRatingInput = document.getElementById('min-rating');
const maxRatingInput = document.getElementById('max-rating');
const movieResultsBlock = document.getElementById('movie-results');
const tagDetails = document.getElementById('tag-details');
const yearDetails = document.getElementById('year-details');



// ---------Data to be used when we hit the search button
// var tagPayLoad = "";
// let rating = "";
// let releaseYear = "";

var queryPayload = {};
queryPayload.tagList = [];
yearSlider.addEventListener('change', (e) => {
    yearValue.innerHTML = e.target.value;
    queryPayload.yearPayload = e.target.value;
})
tagsToggle.addEventListener('click', () => {
    if(tagsInfo.style.display == 'block')
        tagsInfo.style.display = 'none';
    else
        tagsInfo.style.display = 'block';
})

let tagsBar = ()=>{
    if(localStorage.keyword){
        keywordBlock.innerHTML = localStorage.keyword;
        
        // Get the results by Calling API.
        
    fetch("http://localhost:9200/movies/_search", {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _source: ["name", "description", "img"],
            query: {
              match: {
                  name: localStorage.q
              }
            }
        })
    })
    .then(res => res.json())
    .then(
        data => {
                let movies = data.hits.hits
                let moviesHTML = "";
                movies.forEach(movie => {
                    moviesHTML += `
                    <div class="col-12 mb-3 bg-white rounded border p-3">
                        <div class="d-flex">
                            <img src="assets/img/movies/${movie._source.img}" alt="" class="rounded mr-3" height="30px" width="30px">
                            <h3><a href="movie.html?id=${movie._id}">${movie._source.name}</a></h3>
                        </div>
                        <hr/>
                        <p>${movie._source.description}</p>
                    </div>`;
                })
                movieResultsBlock.innerHTML = moviesHTML;
            }
        )
    }
    else{
        keywordBlock.innerHTML = "Search Details"
    }
}

let minRating, maxRating;
minRatingInput.addEventListener('change', e => {
    minRating = e.target.value;
    queryPayload.minRating = minRating;
})

maxRatingInput.addEventListener('change', e => {
    maxRating = e.target.value;
    queryPayload.maxRating = maxRating;
})


let urlParams = (new URL(window.location.href)).searchParams;
if(urlParams.get('q')){
    keywordBlock.innerHTML = urlParams.get('q');
}


// -----------------------Tag Search type as you search ---------
let tagList = new Set();
let hideTagSuggestion = () => { tagSuggestionBlock.style.display = 'none'; }
let showTagSuggestion = () => { tagSuggestionBlock.style.display = 'block'; }

// Select the tag from the suggestions box
function selectTag(e){
    tagSearch.value = e.innerHTML;
    hideTagSuggestion();
}

// Add Button click
tagAddBtn.addEventListener('click', ()=>{
    if(tagSearch.value == "")
        alert('Can\'t be empty!');
    else{
        tagsBox.innerHTML = "";
        tagList.add(tagSearch.value);
        queryPayload.tagPayload = "";
        queryPayload.tagList = [];
        tagSearch.value = "";
        for(let t of tagList){
            tagsBox.innerHTML += `<span class="badge m-1 bg-e-yellow">${t}</span>`;
            queryPayload.tagPayload += " " + t;
            queryPayload.tagList.push(t.trim());
        }
    }
})

var tagSearchPayload = {
    _source: "tags",
    query: {
        bool: {
            must: [
                {
                    match_phrase_prefix:{
                        tags: ""
                    }
                }
            ]
        }
    }
}

tagSearch.addEventListener('keyup', e => {
    showTagSuggestion();
    let text = e.target.value.toLowerCase();;
    if(text != ''){
        searchText = text;
        // Create the payload as per the text
        tagSearchPayload.query.bool.must[0].match_phrase_prefix.tags = text;
        fetch("http://localhost:9200/movies/_search", {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(tagSearchPayload)
        })
        .then(res => res.json())
        .then(
            data => {
                let itemList = data.hits.hits;
                var tagSuggestionSet = new Set();
                itemList.forEach(element => {
                    element._source.tags.forEach(t => tagSuggestionSet.add(t))
                });
                var tagHTML = "<ul>";
                if(tagSuggestionSet.size > 0){
                    tagSuggestionSet.forEach(element => {
                        tagHTML += `<li class="tag-suggestion-item border-bottom mr-2 pl-2 pr-2" onclick="selectTag(this)">${element}</li>`;
                    });
                }
                else{
                    tagHTML = "<b class='p-4 text-center'>No Tags Available</b>"
                }
                tagSuggestionBlock.innerHTML = tagHTML;
            }
        )

    }
    else{
        // No input, hence hide the suggestion box
        hideTagSuggestion();
    }
})



// -------- Query to ES----------
// must = [0] = "actor", [1] = "releaseYear"
let searchPayload = {
    _source: ["name", "description", "img"],
    query: {
      bool: {
        must: []
      }
    }
}

tagsBar(); // In case page is opened from the search button

let resetAdvanceSearch = () => {
    searchPayload = {
        _source: ["name", "description", "img"],
        query: {
          bool: {
            must: []
          }
        }
    }
    localStorage.removeItem('keyword');
    localStorage.removeItem('q');
    tagsBar();
    yearValue.innerHTML = "";
    yearSlider.value = 0;
    minRatingInput.value = "";
    maxRatingInput.value = "";
    tagSearch.value = "";
    tagsBox.innerHTML = "";
}


searchBtn.addEventListener('click', e => {
    let tempMust = searchPayload.query.bool.must;
    let index = 0;
    if(queryPayload.yearPayload){
        while(searchPayload.query.bool.must[index]){
            if(searchPayload.query.bool.must[index].match.releaseYear)
                break;
            index++;
        }
        searchPayload.query.bool.must[index] = {
                match: {
                  releaseYear: queryPayload.yearPayload
                }
            }
    }
    if(queryPayload.tagPayload){
        index = 0;
        while(searchPayload.query.bool.must[index]){
            if(searchPayload.query.bool.must[index].match && searchPayload.query.bool.must[index].match.tags)
                break;
            index++;
        }
        searchPayload.query.bool.must[index] = {
            match: {
            tags: queryPayload.tagPayload
            }
        }
    }
    if(queryPayload.minRating){
        if(searchPayload.query.bool.must[0] && searchPayload.query.bool.must[0].range){
            searchPayload.query.bool.must[0].range.rating.gte = queryPayload.minRating;
        }
        else if(searchPayload.query.bool.must[1] && searchPayload.query.bool.must[1].range){
            searchPayload.query.bool.must[1].range.rating.gte = queryPayload.minRating;
        }else if(searchPayload.query.bool.must[2] && searchPayload.query.bool.must[2].range){
            searchPayload.query.bool.must[2].range.rating.gte = queryPayload.minRating;
        }
        else{
            searchPayload.query.bool.must[tempMust.length] = {
                range: {
                rating: {
                    "gte": queryPayload.minRating
                }
                }
            }
        }
    }
    if(queryPayload.maxRating){
        if(searchPayload.query.bool.must[0] && searchPayload.query.bool.must[0].range){
            searchPayload.query.bool.must[0].range.rating.lte = queryPayload.maxRating;
        }
        else if(searchPayload.query.bool.must[0] && searchPayload.query.bool.must[1].range){
            searchPayload.query.bool.must[1].range.rating.lte = queryPayload.maxRating;
        }else if(searchPayload.query.bool.must[0] && searchPayload.query.bool.must[2].range){
            searchPayload.query.bool.must[2].range.rating.lte = queryPayload.maxRating;
        }
        else{
            searchPayload.query.bool.must[tempMust.length] = {
                range: {
                    rating: {
                        "lte": queryPayload.maxRating
                        }
                }
            }
        }
    }
    fetch("http://localhost:9200/movies/_search", {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchPayload)
        })
        .then(res => res.json())
        .then(
            data => {
                tagDetails.innerHTML = ""; // Clear Old search values
                yearDetails.innerHTML = ""; // Clear Old search values
                let movies = data.hits.hits
                let moviesHTML = "";
                movies.forEach(movie => {
                    moviesHTML += `
                    <div class="col-12 mb-3 bg-white rounded border p-3">
                        <div class="d-flex">
                            <img src="assets/img/movies/${movie._source.img}" alt="" class="rounded mr-3" height="30px" width="30px">
                            <h3><a href="movie.html?id=${movie._id}">${movie._source.name}</a></h3>
                        </div>
                        <hr/>
                        <p>${movie._source.description}</p>
                    </div>`;
                })
                movieResultsBlock.innerHTML = moviesHTML;

                // Show tag details and Year details in the search info block.
                if(queryPayload.tagList.length > 0){
                    tagDetails.innerHTML = "<h5 class='font-weight-bold'>Tags:</h5>";
                    queryPayload.tagList.forEach(tag => {
                        tagDetails.innerHTML += `<span class="bg-e-yellow text-capitalize mb-1 rounded pl-2 pr-2 mr-1">${tag}</span>`;
                    })
                }
                if(queryPayload.yearPayload){
                    yearDetails.innerHTML = "<h5 class='mt-2 font-weight-bold'>Release Year</h5>" + queryPayload.yearPayload;
                }
                // Reset the queryPayload object.
                tagList.clear();
                queryPayload = {};
                queryPayload.tagList = [];
                resetAdvanceSearch();
            }
        )
    console.log(JSON.stringify(searchPayload))
})