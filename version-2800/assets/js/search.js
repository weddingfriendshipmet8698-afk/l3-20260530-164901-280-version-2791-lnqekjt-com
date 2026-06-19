(function () {
  var input = document.getElementById('searchInput');
  var year = document.getElementById('searchYear');
  var genre = document.getElementById('searchGenre');
  var results = document.getElementById('searchResults');
  var items = Array.isArray(MOVIE_INDEX) ? MOVIE_INDEX : [];

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function card(movie) {
    var tags = (movie.tags || '')
      .split(/,|，|、/)
      .filter(Boolean)
      .slice(0, 3)
      .map(function (tag) {
        return '<span>' + escapeHtml(tag.trim()) + '</span>';
      })
      .join('');

    return [
      '<article class="movie-card compact">',
      '<a class="card-cover" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-chip">▶</span>',
      '<span class="year-chip">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.one_line || '') + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '</div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    var y = year.value;
    var g = genre.value;
    var matched = items.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line].join(' ').toLowerCase();
      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (y && movie.year !== y) {
        return false;
      }
      if (g && movie.genre.indexOf(g) === -1 && movie.tags.indexOf(g) === -1) {
        return false;
      }
      return true;
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join('');
  }

  input.value = getQueryParam('q');

  [input, year, genre].forEach(function (node) {
    node.addEventListener('input', render);
    node.addEventListener('change', render);
  });

  render();
})();
