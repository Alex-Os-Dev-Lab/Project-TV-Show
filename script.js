// Global variable to store all TV show episodes fetched from the API
const episodeCache = {};
let allEpisodes = [];

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "Loading shows, please wait...";

  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error(`Failed to load shows: ${response.status}`);
    }
    const shows = await response.json();

    // requirement 5 - sort alphabetically, case-insensitive
    shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    populateShowSelector(shows);
    rootElem.textContent = "Please select a show above.";
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-container">
        <p class="error-message">⚠️ Sorry, we couldn't load the shows.</p>
        <p class="error-details">${error.message}</p>
        <button onclick="location.reload()">Try Again</button>
      </div>`;
  }
}

function populateShowSelector(shows) {
  const showSelect = document.getElementById("show-select");

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", async () => {
    const showId = showSelect.value;
    if (showId === "") return;
    await loadEpisodesForShow(showId);
  });
}

async function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById("root");

  // requirement 6 - use cache if already fetched
  if (!episodeCache[showId]) {
    rootElem.textContent = "Loading episodes, please wait...";
    try {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      if (!response.ok) {
        throw new Error(`Failed to load episodes: ${response.status}`);
      }
      episodeCache[showId] = await response.json();
    } catch (error) {
      rootElem.innerHTML = `
        <div class="error-container">
          <p class="error-message">⚠️ Sorry, we couldn't load the episodes.</p>
          <p class="error-details">${error.message}</p>
          <button onclick="location.reload()">Try Again</button>
        </div>`;
      return;
    }
  }

  allEpisodes = episodeCache[showId];

  // reset search and selector
  document.getElementById("search-input").value = "";
  document.getElementById("searchCount").textContent = "";

  // repopulate episode selector with new show's episodes
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = '<option value="">-- Select an episode --</option>';

  allEpisodes.forEach((episode) => {
    const paddedSeason = String(episode.season).padStart(2, "0");
    const paddedNumber = String(episode.number).padStart(2, "0");
    const code = `S${paddedSeason}E${paddedNumber}`;
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  renderEpisodeGallery(allEpisodes);
  setupSearch();
}

window.onload = setup;

function formatEpisodeCode(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedNumber = episode.number.toString().padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("div");
  episodeCard.classList.add("episode-card");
  const episodeCode = formatEpisodeCode(episode);
  episodeCard.innerHTML = `
    <h2>${episode.name} - ${episodeCode}</h2>
    <img src="${episode.image.medium}" alt="${episode.name}" />
    <div class="episode-summary">${episode.summary}</div>
  `;
  return episodeCard;
}

function renderEpisodeGallery(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    rootElem.appendChild(card);
  });
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchCount = document.getElementById("searchCount");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEpisodes = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm),
    );
    searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
    renderEpisodeGallery(filteredEpisodes);
  });
}
