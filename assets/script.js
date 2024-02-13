// Existing code
let myList = JSON.parse(localStorage.getItem('myList')) || [];
let isListOpen = true; // Initially set to true to display the list
let currentPage = 1; // Current page for pagination

function createBookElement(book) {
  const bookElement = document.createElement('div');
  const openLibraryUrl = `https://openlibrary.org${book.key}`;
  const authors = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
  const summary = book.overview ? book.overview.join(' ') : 'No summary available';
  bookElement.innerHTML = `
    <div class="book-container is-mobile">
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
      <button class="add-to-list button is-white is-rounded" data-api-link="${openLibraryUrl}" data-type="book" data-title="${book.title}" data-author-director="${authors}">Add to My List</button>
    </div>
  `;
  return bookElement;
}

function createMovieElement(omdbData) {
  const movieElement = document.createElement('div');
  const movieSummary = omdbData.Plot ? omdbData.Plot : 'No summary available';
  const director = omdbData.Director ? omdbData.Director : 'Unknown Director';
  movieElement.innerHTML = `
    <div class="movie-container is-mobile">
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
      <button class="add-to-list button is-white is-rounded" data-api-link="https://www.imdb.com/title/${omdbData.imdbID}" data-type="movie" data-title="${omdbData.Title}" data-author-director="${director}">Add to My List</button>
    </div>
  `;
  return movieElement;
}

function addToMyList(apiLink, type, title, authorDirector, button) {
  if (!myList.some(existingItem => existingItem.apiLink === apiLink)) {
    myList.push({ apiLink, type, title, authorDirector });
    localStorage.setItem('myList', JSON.stringify(myList));
    displayNotification('Added to My List!', 'success', button);
    displaySavedList();
  } else {
    displayNotification('Item is already in My List!', 'warning', button);
  }
}

function removeItemFromMyList(apiLink, button) {
  myList = myList.filter(item => item.apiLink !== apiLink);
  localStorage.setItem('myList', JSON.stringify(myList));
  displayNotification('Removed from My List!', 'success', button);
  displaySavedList();
}

function attachAddButtonListeners() {
  const addButtons = document.querySelectorAll('.add-to-list');
  addButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default behavior of the button (e.g., form submission)
      const apiLink = this.dataset.apiLink;
      const type = this.dataset.type;
      const title = this.dataset.title;
      const authorDirector = this.dataset.authorDirector;
      addToMyList(apiLink, type, title, authorDirector, button);
    });
  });
}

function toggleMyList() {
  const savedListContainer = document.getElementById('saved-list');
  
  if (savedListContainer.classList.contains('collapsed')) {
    savedListContainer.classList.remove('collapsed');
  } else {
    savedListContainer.classList.add('collapsed');
  }
}

async function searchResult() {
  const searchTerm = document.getElementById('search-input-field').value;
  const openLibraryUrl = `https://openlibrary.org/search.json?q=${searchTerm}`;
  const omdbUrl = `https://www.omdbapi.com/?t=${searchTerm}&apikey=5b198aca`;
  const loadingIcon = document.getElementById('loading-icon');
  
  // Display loading icon
  loadingIcon.style.display = 'block';

  try {
    const [openLibraryResponse, omdbResponse] = await Promise.all([
      fetch(openLibraryUrl),
      fetch(omdbUrl)
    ]);
    const openLibraryData = await openLibraryResponse.json();
    const omdbData = await omdbResponse.json();
    
    // Hide loading icon after fetching data
    loadingIcon.style.display = 'none';
    displayResults(openLibraryData, omdbData);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('book-results').innerHTML = 'An error occurred while fetching data. Please try again.';
    document.getElementById('movie-results').innerHTML = 'An error occurred while fetching data. Please try again.';
    
    // Hide loading icon in case of error
    loadingIcon.style.display = 'none';
  }
}

function displayResults(openLibraryData, omdbData) {
  const resultsPerPage = 10;
  const bookResultsContainer = document.getElementById('book-results');
  const movieResultsContainer = document.getElementById('movie-results');
  const totalPages = Math.ceil(openLibraryData.docs.length / resultsPerPage);

  bookResultsContainer.innerHTML = '<h2>Book Results</h2>';
  movieResultsContainer.innerHTML = '<h2>Movie Results</h2>';

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const booksToShow = openLibraryData.docs.slice(startIndex, endIndex);

  if (booksToShow.length > 0) {
    booksToShow.forEach(book => {
      const bookElement = createBookElement(book);
      bookResultsContainer.appendChild(bookElement);
    });
  } else {
    bookResultsContainer.innerHTML += 'No books found.';
  }

  if (omdbData.Title) {
    const movieElement = createMovieElement(omdbData);
    movieResultsContainer.appendChild(movieElement);
  } else {
    movieResultsContainer.innerHTML += 'No movie found.';
  }

  attachAddButtonListeners(); // Attach event listeners after adding elements
  displayPagination(totalPages);
}

function displayPagination(totalPages) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      searchResult(); // Re-run the search with the updated page
    });
    paginationContainer.appendChild(pageButton);
  }
}
function displayMyListPagination(totalPages) {
  const myListPaginationContainer = document.getElementById('my-list-pagination');
  myListPaginationContainer.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displaySavedList(); // Re-display My List with the updated page
    });
    myListPaginationContainer.appendChild(pageButton);
  }
}


function displaySavedList() {
  const resultsPerPage = 100000; // Set the desired number of items per page for My List
  const totalPages = Math.ceil(myList.length / resultsPerPage);

  const savedListContainer = document.getElementById('saved-list');
  savedListContainer.innerHTML = ''; // Clear existing content

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const itemsToShow = myList.slice(startIndex, endIndex);

  if (itemsToShow.length > 0) {
    itemsToShow.forEach(item => {
      const savedItemElement = document.createElement('div');
      savedItemElement.innerHTML = `
        <p><strong>Title:</strong> ${item.title}</p>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Author/Director:</strong> ${item.authorDirector}</p>
        <p><a href="${item.apiLink}" target="_blank">View Details</a></p>
        <button class="button remove-from-list is-danger my-list-button" data-api-link="${item.apiLink}">Remove from My List</button> <!-- Added class "my-list-button" -->
        <hr>
      `;
      savedListContainer.appendChild(savedItemElement);

      // Attach event listener to remove button for each item
      const removeButton = savedItemElement.querySelector('.remove-from-list');
      removeButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default behavior of the button (e.g., form submission)
        const apiLink = this.dataset.apiLink;
        removeItemFromMyList(apiLink, removeButton);
      });
    });
  } else {
    savedListContainer.innerHTML = 'Your list is empty.';
  }

  displayMyListPagination(totalPages);
}

function displayNotification(message, type, targetElement) {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification ${type}`;
  notificationElement.textContent = message;

  // Position the notification relative to the target element
  const targetRect = targetElement.getBoundingClientRect();
  const targetTop = targetRect.top + window.scrollY;
  const targetLeft = targetRect.left + window.scrollX;
  notificationElement.style.position = 'absolute';
  notificationElement.style.top = `${targetTop}px`;
  notificationElement.style.left = `${targetLeft + targetRect.width + 10}px`; // Display notification to the right of the target element

  // Calculate the width of the notification to fit the content
  const maxWidth = 200; // Set maximum width
  const textWidth = getTextWidth(message, notificationElement.style.fontSize || 'inherit');
  const width = Math.min(maxWidth, textWidth + 20); // Add padding
  notificationElement.style.width = `${width}px`;

  // Add the notification to the document body
  document.body.appendChild(notificationElement);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    document.body.removeChild(notificationElement);
  }, 3000);
}

// Helper function to calculate text width
function getTextWidth(text, font) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const width = context.measureText(text).width;
  return width;
}

function toggleList() {
  var listContainer = document.getElementById("myListContainer");
  var paginationButtons = document.getElementById("paginationButtons");

  // Toggle the visibility of the list container
  listContainer.style.display = (listContainer.style.display === 'none' || listContainer.style.display === '') ? 'block' : 'none';

  // Toggle the visibility of the pagination buttons based on the list container's visibility
  paginationButtons.style.display = listContainer.style.display === 'block' ? 'block' : 'none';
}

// Initially display saved list
displaySavedList();

// Attach event listener to toggle button
document.getElementById('toggle-list-button').addEventListener('click', toggleMyList);

