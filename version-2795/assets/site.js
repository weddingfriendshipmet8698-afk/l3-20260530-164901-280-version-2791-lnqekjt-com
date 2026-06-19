
(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroSlider() {
    var slides = bySelector('.hero-slide');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      slides[index].classList.remove('active');
      index = next;
      slides[index].classList.add('active');
    }

    function next() {
      show((index + 1) % slides.length);
    }

    slides[0].classList.add('active');
    timer = window.setInterval(next, 5000);

    var panel = document.querySelector('.hero-panel');
    if (panel) {
      panel.addEventListener('mouseenter', function () {
        if (timer) window.clearInterval(timer);
      });
      panel.addEventListener('mouseleave', function () {
        timer = window.setInterval(next, 5000);
      });
    }
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-search-select]');
    var cards = bySelector('[data-movie-card]');
    if (!input || !cards.length) return;

    function normalize(text) {
      return (text || '').toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input.value.trim());
      var category = select ? select.value : 'all';

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search') || card.textContent);
        var bucket = card.getAttribute('data-category') || 'all';
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = category === 'all' || bucket === category;
        card.classList.toggle('hidden', !(okKeyword && okCategory));
      });
    }

    input.addEventListener('input', applyFilter);
    if (select) select.addEventListener('change', applyFilter);
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) return;

    var buttons = bySelector('[data-source]');
    var label = document.querySelector('[data-player-label]');
    var hlsInstance = null;

    function setActiveButton(target) {
      buttons.forEach(function (btn) {
        btn.classList.toggle('active', btn === target);
      });
    }

    function loadSource(url, title) {
      if (label) label.textContent = title || '播放中';

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (/\.m3u8($|\?)/i.test(url) && window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      if (/\.m3u8($|\?)/i.test(url) && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }

      video.src = url;
      video.play().catch(function () {});
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        setActiveButton(button);
        loadSource(button.getAttribute('data-source') || '', button.getAttribute('data-title') || button.textContent);
      });
    });

    if (buttons[0]) {
      buttons[0].click();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayer();
  });
})();
