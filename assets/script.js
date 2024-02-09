// Initialize the list from local storage or create an empty array
let myList = JSON.parse(localStorage.getItem('myList')) || [];

// Function to create a book element
function createBookElement(book) {
  const bookElement = document.createElement('div');
  const openLibraryUrl = `https://openlibrary.org${book.key}`;
  const authors = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
  const summary = book.overview ? book.overview.join(' ') : 'No summary available';
  bookElement.innerHTML = `
    <div class="book-container">
      <a href="${openLibraryUrl}" target="_blank">
        <div class="book-image">
          <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="${book.title} Cover">
        </div>
        <div class="book-info">
          <h3>${book.title}</h3>
          <p><strong>Author(s):</strong> ${authors}</p>
          <p><strong>Summary:</strong> ${summary}</p>
        </div>
      </a>
      <button class="add-to-list" onclick="addToMyList('${openLibraryUrl}', 'book', '${book.title}', '${authors}')">Add to My List</button>
    </div>
  `;
  return bookElement;
}

// Function to create a movie element
function createMovieElement(omdbData) {
  const movieElement = document.createElement('div');
  const movieSummary = omdbData.Plot ? omdbData.Plot : 'No summary available';
  const director = omdbData.Director ? omdbData.Director : 'Unknown Director';
  movieElement.innerHTML = `
    <div class="movie-container">
      <a href="https://www.imdb.com/title/${omdbData.imdbID}" target="_blank">
        <div class="movie-image">
          <img src="${omdbData.Poster}" alt="${omdbData.Title} Poster">
        </div>
        <div class="movie-info">
          <h3>${omdbData.Title}</h3>
          <p><strong>Director:</strong> ${director}</p>
          <p><strong>Summary:</strong> ${movieSummary}</p>
        </div>
      </a>
      <button class="add-to-list" onclick="addToMyList('https://www.imdb.com/title/${omdbData.imdbID}', 'movie', '${omdbData.Title}', '${director}')">Add to My List</button>
    </div>
  `;
  return movieElement;
}

// Function to add an item to the "My List" and save it to local storage
function addToMyList(apiLink, type, title, authorDirector) {
  // Check if the item is already in the list
  if (!myList.some(existingItem => existingItem.apiLink === apiLink)) {
    myList.push({ apiLink, type, title, authorDirector });
    // Save the updated list to local storage
    localStorage.setItem('myList', JSON.stringify(myList));
    displayNotification('Added to My List!', 'success');
    // Refresh the displayed list
    displaySavedList();
  } else {
    displayNotification('Item is already in My List!', 'warning');
  }
}

// Function to remove an item from the "My List" and update local storage
function removeFromMyList(apiLink) {
  myList = myList.filter(item => item.apiLink !== apiLink);
  localStorage.setItem('myList', JSON.stringify(myList));
  displayNotification('Removed from My List!', 'success');
  // Refresh the displayed list
  displaySavedList();
}

// Function to toggle the visibility of the "My List" section
function toggleMyList() {
  const savedListContainer = document.getElementById('saved-list');
  savedListContainer.classList.toggle('collapsed');
}

// Function to fetch and display search results
async function searchResult() {
  const searchTerm = document.getElementById('search-input-field').value;
  const openLibraryUrl = `https://openlibrary.org/search.json?q=${searchTerm}`;
  const omdbUrl = `https://www.omdbapi.com/?t=${searchTerm}&apikey=5b198aca`;
  const loadingIcon = document.getElementById('loading-icon');
  loadingIcon.style.display = 'block';

  try {
    // Fetch data from both APIs concurrently
    const [openLibraryResponse, omdbResponse] = await Promise.all([
      fetch(openLibraryUrl),
      fetch(omdbUrl)
    ]);
    const openLibraryData = await openLibraryResponse.json();
    const omdbData = await omdbResponse.json();
    // Hide loading icon
    loadingIcon.style.display = 'none';
    // Display results
    displayResults(openLibraryData, omdbData);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('book-results').innerHTML = 'An error occurred while fetching data. Please try again.';
    document.getElementById('movie-results').innerHTML = 'An error occurred while fetching data. Please try again.';
    loadingIcon.style.display = 'none';
  }
}

// Function to display search results on the page
function displayResults(openLibraryData, omdbData) {
  const bookResultsContainer = document.getElementById('book-results');
  const movieResultsContainer = document.getElementById('movie-results');
  // Add header to book section
  bookResultsContainer.innerHTML = '<h2>Book Results</h2>';
  movieResultsContainer.innerHTML = '<h2>Movie Results</h2>'; // Add header to movie section
  // Display Open Library results for books
  if (openLibraryData.docs && openLibraryData.docs.length > 0) {
    openLibraryData.docs.forEach(book => {
      const bookElement = createBookElement(book);
      bookResultsContainer.appendChild(bookElement);
    });
  } else {
    bookResultsContainer.innerHTML += 'No books found.';
  }
  // Display OMDB result for movies
  if (omdbData.Title) {
    const movieElement = createMovieElement(omdbData);
    movieResultsContainer.appendChild(movieElement);
  } else {
    movieResultsContainer.innerHTML += 'No movie found.';
  }
}

// Function to display the "My List" section on the page
function displaySavedList() {
  const savedListContainer = document.getElementById('saved-list');
  savedListContainer.innerHTML = '<h2>Saved List</h2>';

  if (myList.length > 0) {
    myList.forEach(item => {
      const savedItemElement = document.createElement('div');
      savedItemElement.innerHTML = `
        <p><strong>Title:</strong> ${item.title}</p>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Author/Director:</strong> ${item.authorDirector}</p>
        <p><a href="${item.apiLink}" target="_blank">View Details</a></p>
        <button onclick="removeFromMyList('${item.apiLink}')">Remove from My List</button>
        <hr>
      `;
      savedListContainer.appendChild(savedItemElement);
    });
  } else {
    savedListContainer.innerHTML += 'Your list is empty.';
  }
}

function displayNotification(message, type) {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification ${type}`;
  notificationElement.textContent = message;
  document.body.appendChild(notificationElement);

  // Remove the notification after 3 seconds (adjust as needed)
  setTimeout(() => {
    document.body.removeChild(notificationElement);
  }, 3000);
}
