const navSearch = document.getElementById('nav-search');
const navImg = document.getElementById('nav-img');
const suggestionBox = document.getElementById('suggestion-box')
const navSearchBtn = document.getElementById('nav-search-btn')

window.onscroll = function() {
  growShrinkLogo()
};

function growShrinkLogo() {
  if (document.body.scrollTop > 5 || document.documentElement.scrollTop > 5) {
    navImg.style.height = '70px';
    navImg.style.width = '70px';
  } else {
    navImg.style.height = '100px';
    navImg.style.width = '100px';
  }
}

var navSearchPayload = {
    _source: "name",
    query: {
        bool: {
        must: [
            {
            wildcard: {
                name: {
                value: ""
                }
            }
            }
        ]
        }
    }
}

let hideSuggestion = () => { suggestionBox.style.display = 'none'; }
let showSuggestion = () => { suggestionBox.style.display = 'block'; }


let searchText = "";
navSearchBtn.addEventListener('click', () => {
    if(searchText == ""){
        alert("Please enter a keyword to search");
    }
    else{
        localStorage.setItem('keyword', searchText);
        searchText = searchText.replace(/[^a-zA-Z ]/g, "");
        localStorage.setItem('q', searchText);
        window.location.href = "search.html";
    }
})


function selectSuggestion(e){
    navSearch.value = e.innerHTML;
    searchText = e.innerHTML;
    hideSuggestion();
}

navSearch.addEventListener('keyup', e => {
    showSuggestion();
    let text = e.target.value.toLowerCase();;
    if(text != ''){
        searchText = text;
        // Create the payload as per the text
        navSearchPayload.query.bool.must[0].wildcard.name.value = text+"*";
        fetch("http://localhost:9200/movies/_search", {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(navSearchPayload)
        })
        .then(res => res.json())
        .then(
            data => {
                let suggestions = data.hits.hits;
                let boxInnerHTML = "Searching...";
                if(suggestions.length > 0){
                    boxInnerHTML = "<ul>";
                    suggestions.forEach(element => {
                        boxInnerHTML += `<li onclick="selectSuggestion(this)">${element._source.name}</li>`
                    });
                    boxInnerHTML += '</ul>';   
                }
                else{
                    boxInnerHTML = "<b class='p-4 text-center'>No Movies Found</b>"
                }
                suggestionBox.innerHTML = boxInnerHTML;
            }
        )

    }
    else{
        // No input, hence hide the suggestion box
        hideSuggestion();
    }
})