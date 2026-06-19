(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupRails() {
    document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
      var rail = wrap.querySelector("[data-rail]");
      var left = wrap.querySelector("[data-rail-left]");
      var right = wrap.querySelector("[data-rail-right]");
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-scope]");
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var genre = panel.querySelector("[data-filter-genre]");
      var list = panel.parentElement ? panel.parentElement.querySelector(".filter-list") : null;
      if (!list) {
        list = document.querySelector(".filter-list");
      }
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var empty = document.createElement("div");
      empty.className = "no-results";
      empty.textContent = "没有找到匹配的影片";

      function valueOf(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = valueOf(input);
        var regionValue = valueOf(region);
        var yearValue = valueOf(year);
        var genreValue = valueOf(genre);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            ok = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            ok = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1 && haystack.indexOf(genreValue) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (!visible) {
          if (!empty.parentElement) {
            list.appendChild(empty);
          }
        } else if (empty.parentElement) {
          empty.parentElement.removeChild(empty);
        }
      }

      [input, region, year, genre].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupRails();
    setupFilters();
  });
})();
