//You can edit ALL of the code here

// Global variable to store all TV show episodes fetched from the API
let allEpisodes = [];

/**
 * Initializes the application when the page loads.
 * Fetches all episodes, displays them in a gallery, and sets up search functionality.
 */
function setup() {
  const allEpisodes = getAllEpisodes();
  renderEpisodeGallery(allEpisodes);
  setupSearch();
}

/**
 * Formats an episode into a standardized code format (e.g., S01E05).
 * Ensures season and episode numbers are padded with leading zeros.
 * @param {Object} episode - The episode object containing season and number
 * @returns {string} Formatted episode code (e.g., "S01E05")
 */
function formatEpisodeCode(episode) {
  // Pad season number to 2 digits (e.g., 1 becomes "01")
  const paddedSeason = episode.season.toString().padStart(2, "0");
  // Pad episode number to 2 digits (e.g., 5 becomes "05")
  const paddedNumber = episode.number.toString().padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

/**
 * Creates a DOM element card for a single episode with its details.
 * Includes episode name, code, image, and summary.
 * @param {Object} episode - The episode object with name, image, summary, season, and number
 * @returns {HTMLElement} A div element containing the formatted episode card
 */
function createEpisodeCard(episode) {
  // Create a new div element for the card
  const episodeCard = document.createElement("div");
  // Add CSS class for styling
  episodeCard.classList.add("episode-card");

  // Format the episode code (e.g., "S01E05")
  const episodeCode = formatEpisodeCode(episode);

  // Populate the card with episode information using HTML
  episodeCard.innerHTML = `
    <h2>${episode.name} - ${episodeCode}</h2>
    <img src="${episode.image.medium}" alt="${episode.name}" />
    <div class="episode-summary">${episode.summary}</div>
  `;

  return episodeCard;
}

/**
 * Renders a list of episodes to the page as a gallery of cards.
 * Clears existing content and displays all episodes from the provided list.
 * @param {Array} episodeList - Array of episode objects to display
 */
function renderEpisodeGallery(episodeList) {
  // Get the root DOM element where episodes will be displayed
  const rootElem = document.getElementById("root");
  // Clear any existing content from previous renders
  rootElem.innerHTML = "";

  // Loop through each episode and create/append a card for it
  episodeList.forEach((episode) => {
    // Create a card element for this episode
    const card = createEpisodeCard(episode);
    // Add the card to the page
    rootElem.appendChild(card);
  });
}

/**
 * Sets up search functionality for filtering episodes.
 * Listens for input changes and filters episodes by name or summary.
 * Updates the display and search result counter in real-time.
 */
function setupSearch() {
  // Get the search input element from the page
  const searchInput = document.getElementById("search-input");
  // Get the element that displays the search results count
  const searchCount = document.getElementById("searchCount");

  // Add event listener that triggers on every keystroke
  searchInput.addEventListener("input", () => {
    // Convert search term to lowercase for case-insensitive matching
    const searchTerm = searchInput.value.toLowerCase();

    // Filter episodes: keep only those whose name or summary contains the search term
    const filteredEpisodes = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm),
    );

    // Update the counter to show how many results match the search
    searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
    // Re-render the gallery with only the filtered episodes
    renderEpisodeGallery(filteredEpisodes);
  });
}

/**
 * Execute the setup function when the page finishes loading.
 * This initializes all episodes and search functionality.
 */
window.onload = setup;

/**
 * Alternative search function (appears to be legacy code).
 * Similar to setupSearch() but with slightly different implementation.
 * @param {Array} episodeList - Array of episode objects to search through
 * @note: This function may be redundant with setupSearch() - consider removing
 */
function makeSearch(episodeList) {
  // Get the search input element from the page
  const searchInput = document.getElementById("search-input");

  // Add event listener that responds to every keystroke in the search box
  searchInput.addEventListener("input", () => {
    // Make the search case-insensitive by converting input to lowercase
    const searchTerm = searchInput.value.toLowerCase();

    // If search box is empty, show all episodes and clear the counter
    if (searchTerm === "") {
      makePageForEpisodes(episodeList);
      document.getElementById("searchCount").textContent = "";
      return;
    }

    // Filter episodes: keep only those whose name or summary contains the search term
    const filteredEpisodes = episodeList.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm),
    );

    // Display filtered results and show count of matching episodes
    makePageForEpisodes(filteredEpisodes);
    document.getElementById("searchCount").textContent =
      `${filteredEpisodes.length} episode(s) match your search`;
  });
}
