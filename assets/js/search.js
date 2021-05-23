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

let minRating, maxRating;
document.getElementById('min-rating').addEventListener('change', e => {
    minRating = e.target.value;
    queryPayload.minRating = minRating;
})

document.getElementById('max-rating').addEventListener('change', e => {
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
    query: {
      bool: {
        must: [
          {
            match: {
              actors: "dave"
            }
          },
          {
            match: {
              releaseYear: 2018
            }
          }
        ]
      }
    }
}

searchBtn.addEventListener('click', e => {
  console.log(queryPayload)  
})