//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  // Adding event listener for search input
  makeSearch(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // 1. Clear the root element of all existing content
  rootElem.innerHTML = "";

  // 2. Loop through every episode in the array
  episodeList.forEach((episode) => {
    // 3. Create a container <div> for this specific episode
    const episodeCard = document.createElement("div");
    episodeCard.classList.add("episode-card");

    // 4. Create the Episode Code (Requirement: S02E07 style)
    const paddedSeason = episode.season.toString().padStart(2, "0");
    const paddedNumber = episode.number.toString().padStart(2, "0");
    const episodeCode = `S${paddedSeason}E${paddedNumber}`;

    // 5. Create the Title element (Name + Code)
    const title = document.createElement("h2");
    title.innerText = `${episode.name} - ${episodeCode}`;

    // 6. Create the Image element
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = episode.name;

    // 7. Create the Summary element
    // Note: We use innerHTML here because the API summary contains <p> tags
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    // 8. Add all these parts into the episodeCard
    episodeCard.appendChild(title);
    episodeCard.appendChild(image);
    episodeCard.appendChild(summary);

    // 9. Finally, add the finished card into the root element
    rootElem.appendChild(episodeCard);
  });
}

// adding searchbox
function makeSearch(episodeList) {
  const searchInput = document.getElementById("search-input");
  
  //input event listener responds at every keystroke
  searchInput.addEventListener("input", () => {
    //make the search case insensitive
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === "") {
      makePageForEpisodes(episodeList);
      document.getElementById("searchCount").textContent = "";
      return;
    }
    
    const filteredEpisodes = episodeList.filter(episode => 
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
    );
    
    //count and display number of search results
    makePageForEpisodes(filteredEpisodes);
    document.getElementById("searchCount").textContent = 
      `${filteredEpisodes.length} episode(s) match your search`;
  });
}

window.onload = setup;
