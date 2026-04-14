//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // 1. Clear the root element of all existing content
  rootElem.innerHTML = "";

  // 2. Loop through every episode in the array
  episodeList.forEach((episode) => {
    // 3. Create a container <div> for specific episode
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
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    // 8. Add all these parts into the episodeCard
    episodeCard.appendChild(title);
    episodeCard.appendChild(image);
    episodeCard.appendChild(summary);

    // 9. add the finished card into the root element
    rootElem.appendChild(episodeCard);
  });
}

window.onload = setup;
