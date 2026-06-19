(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function advance(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        advance(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        advance(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        advance(1);
        start();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-area]').forEach(function(area) {
    const input = area.querySelector('[data-card-search]');
    const list = document.querySelector('[data-card-list]');
    const buttons = Array.from(area.querySelectorAll('[data-year-filter]'));
    let year = 'all';

    function applyFilter() {
      if (!list) {
        return;
      }
      const query = input ? input.value.trim().toLowerCase() : '';
      list.querySelectorAll('.movie-card').forEach(function(card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.year || '',
          card.dataset.region || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();
        const matchQuery = !query || haystack.indexOf(query) !== -1;
        const matchYear = year === 'all' || (card.dataset.year || '').indexOf(year) === 0;
        card.classList.toggle('hidden-card', !(matchQuery && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        year = button.dataset.yearFilter || 'all';
        buttons.forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });
}());
