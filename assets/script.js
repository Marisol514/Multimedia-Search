
async function search() {
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
  