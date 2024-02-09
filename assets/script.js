async function searchResult() {
  const searchTerm = document.getElementById('search-input-field').value;
  const openLibraryUrl = `https://openlibrary.org/search.json?q=${searchTerm}`;
  const omdbUrl = `https://www.omdbapi.com/?t=${searchTerm}&apikey=5b198aca`;
  const loadingIcon = document.getElementById('loading-icon');
  loadingIcon.style.display = 'block';

  try {
    // Fetch data from Open Library API
    const openLibraryResponse = await fetch(openLibraryUrl);
    const openLibraryData = await openLibraryResponse.json();

    // Fetch data from OMDB API
    const omdbResponse = await fetch(omdbUrl);
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

function displayResults(openLibraryData, omdbData) {
  const bookResultsContainer = document.getElementById('book-results');
  const movieResultsContainer = document.getElementById('movie-results');

  // Add header to book section
  bookResultsContainer.innerHTML = '<h2>Book Results</h2>';
  movieResultsContainer.innerHTML = ''; // Clear previous results

  // Display Open Library results
  if (openLibraryData.docs && openLibraryData.docs.length > 0) {
    openLibraryData.docs.forEach(book => {
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
        </div>
      `;
      bookResultsContainer.appendChild(bookElement);
    });
  } else {
    bookResultsContainer.innerHTML += 'No books found.';
  }

  // Add header to movie section
  movieResultsContainer.innerHTML = '<h2>Movie Finds</h2>';

  // Display OMDB result
  if (omdbData.Title) {
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
      </div>
    `;
    movieResultsContainer.appendChild(movieElement);
  } else {
    movieResultsContainer.innerHTML += 'No movie found.';
  }
}

