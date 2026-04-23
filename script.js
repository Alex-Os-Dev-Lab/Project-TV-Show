// Global variable to store all TV show episodes fetched from the API
const episodeCache = {};
let allEpisodes = [];

// Global cache for shows
let showsCache = null;
let allShows = [];

// View management functions
function showShowsView() {
  document.getElementById("shows-container").classList.remove("hidden");
  document.getElementById("episodes-container").classList.add("hidden");
  document.getElementById("episodes-controls").classList.add("hidden");
  document.getElementById("nav-bar").classList.add("hidden");
}

function showEpisodesView() {
  document.getElementById("shows-container").classList.add("hidden");
  document.getElementById("episodes-container").classList.remove("hidden");
  document.getElementById("episodes-controls").classList.remove("hidden");
  document.getElementById("nav-bar").classList.remove("hidden");
}

// Initialize the application on page load
async function setupApplication() {
  try {
    const shows = await fetchAllShows();
    // Sort alphabetically, case-insensitive
    shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
    allShows = shows;
    renderShowsListing(shows);
    setupShowSelector(shows);
    setupShowSearch(shows);
    setupBackButton();
    showShowsView();
  } catch (error) {
    document.getElementById("shows-container").innerHTML = `
      <div class="error-container">
        <p class="error-message">⚠️ Sorry, we couldn't load the shows.</p>
        <p class="error-details">${error.message}</p>
        <button onclick="location.reload()">Try Again</button>
      </div>`;
  }
}
// Fetch shows once and cache them (Requirement 6: never fetch the same URL twice)
async function fetchAllShows() {
  if (showsCache) return showsCache;

  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) {
    throw new Error(`Failed to load shows: ${response.status}`);
  }
  showsCache = await response.json();
  return showsCache;
}

// Render all shows as cards
function renderShowsListing(shows) {
  const showsContainer = document.getElementById("shows-container");
  showsContainer.innerHTML = "";

  shows.forEach((show) => {
    const card = createShowCard(show);
    showsContainer.appendChild(card);
  });
}

// Create a show card element
function createShowCard(show) {
  const showCard = document.createElement("div");
  showCard.classList.add("show-card");

  const imageSrc = show.image ? show.image.original : "";

  showCard.innerHTML = `
    <h2>${show.name}</h2>
    ${imageSrc ? `<img src="${imageSrc}" alt="${show.name}" />` : `<p class="no-image">No image available</p>`}
    <p><strong>Status:</strong> ${show.status || "Unknown"}</p>
    <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
    <p><strong>Runtime:</strong> ${show.runtime || "N/A"} min</p>
    <p><strong>Genres:</strong> ${show.genres.join(", ") || "Unknown"}</p>
    <div class="show-summary">${show.summary || "No summary available."}</div>
  `;

  showCard.addEventListener("click", () => {
    loadEpisodesForShow(show.id);
  });

  return showCard;
}

function setupShowSelector(shows) {
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

// Setup show search functionality (filter shows by name, genres, or summary)
function setupShowSearch(shows) {
  const showsSearchInput = document.getElementById("shows-search-input");

  showsSearchInput.addEventListener("input", () => {
    const searchTerm = showsSearchInput.value.toLowerCase();
    const filteredShows = shows.filter(
      (show) =>
        show.name.toLowerCase().includes(searchTerm) ||
        (show.genres &&
          show.genres.some((g) => g.toLowerCase().includes(searchTerm))) ||
        (show.summary && show.summary.toLowerCase().includes(searchTerm)),
    );
    // Re-render filtered shows (event listeners are automatically re-attached by createShowCard)
    renderShowsListing(filteredShows);
  });
}

// Setup back button
function setupBackButton() {
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", () => {
    document.getElementById("show-select").value = "";
    document.getElementById("shows-search-input").value = "";
    renderShowsListing(allShows);
    showShowsView();
  });
}

async function loadEpisodesForShow(showId) {
  const episodesContainer = document.getElementById("episodes-container");
  episodesContainer.textContent = "Loading episodes, please wait...";

  showEpisodesView();

  // requirement 6 - use cache if already fetched
  if (!episodeCache[showId]) {
    try {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      if (!response.ok) {
        throw new Error(`Failed to load episodes: ${response.status}`);
      }
      episodeCache[showId] = await response.json();
    } catch (error) {
      episodesContainer.innerHTML = `
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

  // Listen for changes on the episode dropdown
  episodeSelect.addEventListener("change", (event) => {
    const selectedCode = event.target.value;
    const searchCount = document.getElementById("searchCount");

    if (selectedCode === "") {
      // If the user selects the default "-- Select an episode --" option, show all
      renderEpisodeGallery(allEpisodes);
      searchCount.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;
    } else {
      // Filter down to the single episode that matches the selected SxxExx code
      const filteredEpisode = allEpisodes.filter((episode) => {
        return formatEpisodeCode(episode) === selectedCode;
      });
      renderEpisodeGallery(filteredEpisode);
      searchCount.textContent = `Displaying 1 / ${allEpisodes.length} episodes`;
    }
  });

  renderEpisodeGallery(allEpisodes);
  setupSearch();
}

window.onload = setupApplication;

function formatEpisodeCode(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedNumber = episode.number.toString().padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("div");
  episodeCard.classList.add("episode-card");
  const episodeCode = formatEpisodeCode(episode);

  const imageSrc = episode.image ? episode.image.medium : "";

  episodeCard.innerHTML = `
    <h2>${episode.name} - ${episodeCode}</h2>
    ${imageSrc ? `<img src="${imageSrc}" alt="${episode.name}" />` : `<p class="no-image">No image available</p>`}
    <div class="episode-summary">${episode.summary || "No summary available."}</div>
  `;
  return episodeCard;
}
function renderEpisodeGallery(episodeList) {
  const episodesContainer = document.getElementById("episodes-container");
  episodesContainer.innerHTML = "";
  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    episodesContainer.appendChild(card);
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
