(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var minis = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-mini]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
      minis.forEach(function (mini, i) {
        mini.classList.toggle('active', i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        play();
      });
    });

    minis.forEach(function (mini, i) {
      mini.addEventListener('mouseenter', function () {
        activate(i);
        play();
      });
    });

    activate(0);
    play();
  }

  var filterList = document.querySelector('[data-filter-list]');

  if (filterList) {
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var genre = document.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var g = genre ? genre.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }

        if (y && cardYear !== y) {
          ok = false;
        }

        if (g && cardGenre.indexOf(g) === -1) {
          ok = false;
        }

        card.hidden = !ok;
      });
    }

    [input, year, genre].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });
  }
})();
