
async function searchResult() {
    const searchTerm = document.getElementById('search-input').value;
    const openLibraryUrl = `https://openlibrary.org/search.json?q=${searchTerm} `;
    const omdbUrl = `http://www.omdbapi.com/?t=${searchTerm}&apikey=5b198aca`;
  
    try {
      // Fetch data from Open Library API
      const openLibraryResponse = await fetch(openLibraryUrl);
      const openLibraryData = await openLibraryResponse.json();
  
      // Fetch data from OMDB API
      const omdbResponse = await fetch(omdbUrl);
      const omdbData = await omdbResponse.json();
  
      // Display results
      displayResults(openLibraryData, omdbData);
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('results').innerHTML = 'An error occurred. Please try again.';
    }
  }
  
  function displayResults(openLibraryData, omdbData) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
  
    // Display Open Library results
    if (openLibraryData.docs && openLibraryData.docs.length > 0) {
      resultsContainer.innerHTML += '<h2>Books from Open Library</h2>';
      openLibraryData.docs.forEach(book => {
        resultsContainer.innerHTML += `
          <div>
            <h3>${book.title}</h3>
            <p>Author(s): ${book.author_name ? book.author_name.join(', ') : 'N/A'}</p>
          </div>
        `;
      });
    }
  
    // Display OMDB result
    if (omdbData.Title) {
      resultsContainer.innerHTML += '<h2>Movie from OMDB</h2>';
      resultsContainer.innerHTML += `
        <div>
          <h3>${omdbData.Title}</h3>
          <p>Director: ${omdbData.Director}</p>
          <img src="${omdbData.Poster}" alt="${omdbData.Title} Poster">
        </div>
      `;
    }
  
    // If no results found
    if (!openLibraryData.docs.length && !omdbData.Title) {
      resultsContainer.innerHTML = 'No results found.';
    }
  }