//Anime rankings

async function fetchAnime() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime');
        const data = await response.json();
        const animeList = document.getElementById('animeList');

        // Create a table element
        const table = document.createElement('table');
        table.className = 'table table-striped table-dark';

        // Create a table header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Rank</th>
            <th>Title</th>
            <th>Score</th>
            <th>Episodes</th>
            <th>Start Date</th>
            <th>End Date</th>
        `;
        table.appendChild(headerRow);

        // Create table rows for each anime
        data.data.forEach(anime => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${anime.rank}</td>
                <td><a href="${anime.url}" target="_blank">${anime.title}</a></td>
                <td>${anime.score}</td>
                <td>${anime.episodes}</td>
                <td>${anime.start_date}</td>
                <td>${anime.end_date}</td>
            `;
            table.appendChild(row);
        });

        // Append the table to the animeList element
        animeList.appendChild(table);
    } catch (error) {
        console.error('Error fetching anime data:', error);
    }
}

fetchAnime();


//Pagination

const animeContainer = document.getElementById('anime-container');
const itemsPerPage = 4; // Number of items per page
let currentPage = 1; // Current page number
let animeData = []; // Store fetched anime data

async function fetchAAnime() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/anime?status=airing');
        const data = await response.json();
        animeData = data.data; // Store the fetched data
        displayAnime(animeData);
        setupPagination(animeData.length);
    } catch (error) {
        console.error('Error fetching anime:', error);
    }
}

function displayAnime(animeList) {
    animeContainer.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedAnime = animeList.slice(start, end);

    paginatedAnime.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'col-md-3';

        card.innerHTML = `
            <div class="card h-100">
                <img src="${anime.images.jpg.large_image_url}" class="card-img-top" alt="${anime.title}">
                <div class="card-body">
                    <h5 class="card-title">${anime.title}</h5>
                </div>
                <div class="card-footer">
                    <a href="${anime.url}" target="_blank" class="btn btn-primary">Watch Now</a>
                </div>
            </div>
        `;

        animeContainer.appendChild(card);
    });
}

function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');

    // Update pagination links
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.getElementById(`page-${i}`);
        if (pageLink) {
            pageLink.style.display = i <= totalPages ? 'inline' : 'none';
            pageLink.classList.remove('active');
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                displayAnime(animeData);
                updatePagination();
            });
        }
    }

    // Show or hide previous and next buttons
    document.getElementById('prev').style.display = currentPage === 1 ? 'none' : 'inline';
    document.getElementById('next').style.display = currentPage === totalPages ? 'none' : 'inline';

    // Previous button event
    document.getElementById('prev').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayAnime(animeData);
            updatePagination();
        }
    });

    // Next button event
    document.getElementById('next').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displayAnime(animeData);
            updatePagination();
        }
    });
}

function updatePagination() {
    const pageLinks = document.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(`page-${currentPage}`).classList.add('active');
}

// Initial fetch
fetchAAnime();



//DEBOUNCING

const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions');
const debounceDelay = 300; // Delay in milliseconds
let debounceTimeout;

// Function to fetch anime suggestions
async function fetchAnimeSuggestions(query) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&sfw`);
        const data = await response.json();
        return data.data; // Return the list of suggestions
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

// Function to display suggestions
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none'; // Hide if no suggestions
        return;
    }

    suggestions.forEach(anime => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item p-2 cursor-pointer';
        suggestionItem.innerText = anime.title;

        // Redirect to the anime page on click
        suggestionItem.addEventListener('click', () => {
            window.location.href = anime.url; // Redirect to the selected anime
        });

        suggestionsContainer.appendChild(suggestionItem);
    });

    suggestionsContainer.style.display = 'block'; // Show suggestions
}

// Debounce function
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Event listener for search input
searchInput.addEventListener('input', debounce(async () => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
        const suggestions = await fetchAnimeSuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsContainer.style.display = 'none'; // Hide if input is empty
    }
}, debounceDelay));

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!suggestionsContainer.contains(event.target) && event.target !== searchInput) {
        suggestionsContainer.style.display = 'none'; // Hide suggestions
    }
});
