(function () {
  function $$ (sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    const slides = $$('[data-hero-slide]', slider);
    if (slides.length <= 1) return;
    let index = 0;
    const show = (next) => {
      slides[index].classList.remove('active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
    };
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    if (prev) prev.addEventListener('click', () => show(index - 1));
    if (next) next.addEventListener('click', () => show(index + 1));
    setInterval(() => show(index + 1), 5000);
  }

  function initPageSearch() {
    const input = document.querySelector('[data-site-search]');
    if (!input) return;
    const go = () => {
      const q = input.value.trim();
      if (!q) return;
      location.href = 'search.html?q=' + encodeURIComponent(q);
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') go();
    });
    const btn = document.querySelector('[data-search-go]');
    if (btn) btn.addEventListener('click', go);
  }

  function initLocalFilter() {
    const input = document.querySelector('[data-filter-input]');
    const target = document.querySelector('[data-filter-target]');
    if (!input || !target) return;
    const cards = $$('[data-filter-item]', target);
    const empty = document.querySelector('[data-filter-empty]');
    const run = () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const hit = !q || text.includes(q);
        card.style.display = hit ? '' : 'none';
        if (hit) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    };
    input.addEventListener('input', run);
    run();
  }

  function initPlayer() {
    const root = document.querySelector('[data-player]');
    if (!root) return;
    const video = root.querySelector('video');
    const cover = root.querySelector('[data-player-cover]');
    const btn = root.querySelector('[data-player-play]');
    const stream = root.getAttribute('data-stream');
    if (!video || !stream) return;

    function start() {
      if (cover) cover.hidden = true;
      if (window.Hls && window.Hls.isSupported()) {
        if (root._hls) {
          try { root._hls.destroy(); } catch (e) {}
        }
        const hls = new Hls();
        root._hls = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function(){});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function(){});
      } else {
        video.src = stream;
        video.play().catch(function(){});
      }
    }

    if (btn) btn.addEventListener('click', start);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-player-play]')) return;
      if (cover && !cover.hidden) start();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroSlider();
    initPageSearch();
    initLocalFilter();
    initPlayer();
  });
})();
