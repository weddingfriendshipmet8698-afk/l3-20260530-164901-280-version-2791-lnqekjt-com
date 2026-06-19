(function() {
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  function createCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="card-play">播放</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function(character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function render(query) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = (window.MOVIE_SEARCH_DATA || []).filter(function(movie) {
      if (!words.length) {
        return true;
      }
      const haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return words.every(function(word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    results.innerHTML = list.map(createCard).join('');
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', function() {
      render(input.value);
    });
  }

  render(initialQuery);
}());
