(function () {
  "use strict";

  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@latest";
  var hlsLoader = null;

  function basePath() {
    return document.body.getAttribute("data-base") || "./";
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("player"));
        }
      };
      script.onerror = function () {
        reject(new Error("player"));
      };
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  function initMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        event.preventDefault();
        window.location.href = basePath() + "search.html?q=" + encodeURIComponent(value);
      });
    });
  }

  function showPlayerMessage(shell, text) {
    var box = shell.querySelector(".player-message");
    if (box) {
      box.textContent = text;
      box.style.display = "block";
    }
  }

  function startVideo(shell) {
    if (shell.getAttribute("data-started") === "1") {
      return;
    }
    shell.setAttribute("data-started", "1");
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      showPlayerMessage(shell, "暂时无法播放，请稍后重试");
      return;
    }
    var playNow = function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
          shell.setAttribute("data-started", "0");
        });
      }
    };
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      playNow();
      return;
    }
    loadHlsLibrary().then(function (Hls) {
      if (Hls.isSupported()) {
        var player = new Hls({ enableWorker: true, lowLatencyMode: true });
        player.loadSource(stream);
        player.attachMedia(video);
        player.on(Hls.Events.MANIFEST_PARSED, playNow);
        player.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showPlayerMessage(shell, "暂时无法播放，请稍后重试");
          }
        });
      } else {
        showPlayerMessage(shell, "暂时无法播放，请稍后重试");
      }
    }).catch(function () {
      showPlayerMessage(shell, "暂时无法播放，请稍后重试");
    });
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var overlay = shell.querySelector(".player-overlay");
      var video = shell.querySelector("video");
      if (overlay) {
        overlay.addEventListener("click", function () {
          startVideo(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!video.currentSrc) {
            startVideo(shell);
          }
        });
      }
    });
  }

  function initFilters() {
    var area = document.querySelector("[data-filter-area]");
    if (!area) {
      return;
    }
    var keyword = area.querySelector("[data-filter-keyword]");
    var selects = area.querySelectorAll("select[data-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var apply = function () {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var selected = {};
      selects.forEach(function (select) {
        selected[select.getAttribute("data-filter")] = select.value;
      });
      cards.forEach(function (card) {
        var visible = true;
        if (q) {
          visible = (card.getAttribute("data-text") || "").toLowerCase().indexOf(q) !== -1;
        }
        Object.keys(selected).forEach(function (key) {
          var value = selected[key];
          if (visible && value) {
            var target = card.getAttribute("data-" + key) || "";
            visible = target.indexOf(value) !== -1;
          }
        });
        card.style.display = visible ? "" : "none";
      });
    };
    if (keyword) {
      keyword.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  function renderSearchResults() {
    var mount = document.querySelector("[data-search-results]");
    if (!mount || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    if (input) {
      input.value = q;
    }
    var normalized = q.toLowerCase();
    var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return movie.search.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (!results.length) {
      mount.innerHTML = "<div class=\"empty-tip\">没有找到匹配影片</div>";
      return;
    }
    mount.innerHTML = results.map(function (movie) {
      return [
        "<article class=\"movie-card\" data-movie-card>",
        "<a class=\"poster-link\" href=\"" + basePath() + "video/" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
        "<img src=\"" + basePath() + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-overlay\">立即观看</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "<h3><a href=\"" + basePath() + "video/" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"tag-row\"><span>" + escapeHtml(movie.genre) + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenus();
    initSearchForms();
    initPlayers();
    initFilters();
    renderSearchResults();
  });
})();
