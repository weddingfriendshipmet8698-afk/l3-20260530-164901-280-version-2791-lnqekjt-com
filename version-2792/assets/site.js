(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function decodeParam(value) {
    try {
      return decodeURIComponent(value || "");
    } catch (err) {
      return value || "";
    }
  }

  function buildMovieHref(id) {
    return "../movie/" + id + "/index.html";
  }

  function setupMenu() {
    var toggle = qs("[data-menu-toggle]");
    var nav = qs("[data-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });

    qsa("[data-nav] a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupHeroCarousel() {
    var slides = qsa("[data-hero-slide]");
    if (!slides.length) {
      return;
    }
    var dots = qsa("[data-hero-dot]");
    var carousel = qs("[data-hero-carousel]");
    var index = slides.findIndex(function (el) { return el.classList.contains("is-active"); });
    if (index < 0) {
      index = 0;
    }

    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        start();
      });
    });

    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      carousel.addEventListener("focusin", stop);
      carousel.addEventListener("focusout", start);
    }

    show(index);
    start();
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[·、,，/()（）\-_.]/g, "");
  }

  function getGenreSet(item) {
    var genres = (item.genre || "").split(/[\/、,，]+/).map(function (s) {
      return s.trim();
    }).filter(Boolean);
    return genres;
  }

  function uniqueSorted(arr) {
    return Array.from(new Set(arr)).sort(function (a, b) {
      return String(a).localeCompare(String(b), "zh-Hans-CN");
    });
  }

  function setupSearchApp() {
    var app = qs("[data-search-app]");
    if (!app || !window.MOVIES_DATA) {
      return;
    }

    var input = qs("[data-search-input]", app);
    var genreSelect = qs("[data-filter-genre]", app);
    var typeSelect = qs("[data-filter-type]", app);
    var yearSelect = qs("[data-filter-year]", app);
    var clearBtn = qs("[data-clear-filters]", app);
    var results = qs("[data-search-results]", app);
    var countLabel = qs("[data-result-count]", app);
    var sampleTags = qs("[data-search-tags]", app);

    var movies = window.MOVIES_DATA.slice();

    var genres = uniqueSorted(movies.flatMap(function (movie) {
      return getGenreSet(movie);
    }));
    var types = uniqueSorted(movies.map(function (movie) { return movie.type || ""; }).filter(Boolean));
    var years = uniqueSorted(movies.map(function (movie) { return String(movie.year || ""); }).filter(Boolean)).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    function fillSelect(select, items, label) {
      if (!select) {
        return;
      }
      select.innerHTML = "";
      var all = document.createElement("option");
      all.value = "全部";
      all.textContent = "全部" + label;
      select.appendChild(all);
      items.forEach(function (item) {
        var opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
      });
    }

    fillSelect(genreSelect, genres, "题材");
    fillSelect(typeSelect, types, "类型");
    fillSelect(yearSelect, years, "年份");

    function initialFromQuery() {
      var params = new URLSearchParams(window.location.search);
      var q = decodeParam(params.get("q") || "");
      if (input && q) {
        input.value = q;
      }
      return {
        q: q.toLowerCase(),
        genre: params.get("genre") || "全部",
        type: params.get("type") || "全部",
        year: params.get("year") || "全部"
      };
    }

    var state = initialFromQuery();

    if (genreSelect) genreSelect.value = state.genre;
    if (typeSelect) typeSelect.value = state.type;
    if (yearSelect) yearSelect.value = state.year;

    function movieMatches(movie) {
      var haystack = normalizeText([
        movie.title,
        movie.one_line,
        movie.genre,
        movie.type,
        movie.region,
        movie.year
      ].join(" "));

      var q = normalizeText(input ? input.value : state.q);
      var genre = genreSelect ? genreSelect.value : state.genre;
      var type = typeSelect ? typeSelect.value : state.type;
      var year = yearSelect ? yearSelect.value : state.year;

      var genreMatch = genre === "全部" || getGenreSet(movie).indexOf(genre) >= 0;
      var typeMatch = type === "全部" || (movie.type || "") === type;
      var yearMatch = year === "全部" || String(movie.year || "") === year;
      var queryMatch = !q || haystack.indexOf(q) >= 0;

      return genreMatch && typeMatch && yearMatch && queryMatch;
    }

    function cardHtml(movie) {
      return [
        '<a class="movie-card" href="' + buildMovieHref(movie.id) + '">',
        '  <div class="poster-wrap">',
        '    <img src="../assets/posters/' + movie.id + '.svg" alt="' + escapeHtml(movie.title) + '" class="poster" loading="lazy">',
        '    <div class="poster-glow"></div>',
        '    <div class="poster-badge">' + escapeHtml(movie.type || "影片") + '</div>',
        "  </div>",
        '  <div class="movie-card-body">',
        '    <h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(String(movie.year || "")) + '</span>',
        '      <span>·</span>',
        '      <span>' + escapeHtml(movie.genre || "") + '</span>',
        "    </div>",
        '    <p class="movie-one-line">' + escapeHtml(movie.one_line || "") + '</p>',
        "  </div>",
        "</a>"
      ].join("\n");
    }

    function renderTags() {
      if (!sampleTags) return;
      var keywords = movies.slice(0, 16).map(function (m) {
        return (getGenreSet(m)[0] || m.type || "影片");
      });
      sampleTags.innerHTML = keywords.map(function (k) {
        return '<a class="tag" href="?q=' + encodeURIComponent(k) + '">' + escapeHtml(k) + "</a>";
      }).join("");
    }

    function render() {
      var filtered = movies.filter(movieMatches);
      countLabel.textContent = "找到 " + filtered.length + " 部影片";
      results.innerHTML = filtered.slice(0, 200).map(cardHtml).join("");
      if (!filtered.length) {
        results.innerHTML = '<div class="panel" style="padding:24px;border-radius:24px;">没有找到符合条件的影片。</div>';
      }
    }

    function bind() {
      [input, genreSelect, typeSelect, yearSelect].forEach(function (el) {
        if (!el) return;
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      });
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          if (input) input.value = "";
          if (genreSelect) genreSelect.value = "全部";
          if (typeSelect) typeSelect.value = "全部";
          if (yearSelect) yearSelect.value = "全部";
          render();
        });
      }
    }

    renderTags();
    bind();
    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupDetailPlayer() {
    var shell = qs("[data-player-shell]");
    if (!shell) {
      return;
    }
    var video = qs("video", shell);
    var playBtn = qs("[data-player-play]", shell);
    var buttons = qsa("[data-player-source]", shell);
    var currentLabel = qs("[data-player-current]", shell);
    var mp4 = shell.getAttribute("data-mp4");
    var hls = shell.getAttribute("data-hls");

    function setCurrent(text) {
      if (currentLabel) {
        currentLabel.textContent = text;
      }
    }

    function useSource(kind) {
      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-player-source") === kind);
      });

      if (kind === "hls") {
        video.src = hls || mp4;
        video.type = "application/vnd.apple.mpegurl";
        setCurrent("当前源：HLS 示例");
      } else {
        video.src = mp4;
        video.type = "video/mp4";
        setCurrent("当前源：MP4 示例");
      }

      video.load();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        useSource(button.getAttribute("data-player-source"));
      });
    });

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        video.play().catch(function () {
          setCurrent("浏览器拦截了自动播放，请再点一次播放");
        });
      });
    }

    video.addEventListener("play", function () {
      if (currentLabel) currentLabel.textContent = currentLabel.textContent.replace("（已暂停）", "");
    });

    video.addEventListener("pause", function () {
      if (currentLabel) currentLabel.textContent = currentLabel.textContent.replace("（已暂停）", "") + "（已暂停）";
    });

    useSource("mp4");
  }

  function setupDetailTabs() {
    var tabs = qsa("[data-tab-target]");
    if (!tabs.length) return;
    var panels = qsa("[data-tab-panel]");
    function activate(id) {
      tabs.forEach(function (tab) {
        tab.classList.toggle("is-active", tab.getAttribute("data-tab-target") === id);
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("hidden", panel.getAttribute("data-tab-panel") !== id);
      });
    }
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab-target"));
      });
    });
    activate(tabs[0].getAttribute("data-tab-target"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHeroCarousel();
    setupSearchApp();
    setupDetailPlayer();
    setupDetailTabs();
  });
})();
