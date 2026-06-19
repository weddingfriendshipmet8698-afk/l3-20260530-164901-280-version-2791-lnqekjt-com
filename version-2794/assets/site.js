(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === activeSlide);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var searchInput = filterRoot.querySelector('[data-filter-search]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var categorySelect = filterRoot.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
        var empty = filterRoot.querySelector('[data-empty-result]');

        function applyFilter() {
            var query = (searchInput && searchInput.value || '').trim().toLowerCase();
            var year = yearSelect && yearSelect.value || '';
            var category = categorySelect && categorySelect.value || '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchCategory = !category || card.getAttribute('data-category') === category;
                var shouldShow = matchQuery && matchYear && matchCategory;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [searchInput, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var playerShell = document.querySelector('[data-player-shell]');
    if (playerShell) {
        var video = playerShell.querySelector('video');
        var source = playerShell.getAttribute('data-source');
        var started = false;

        function startPlayer() {
            if (!video || !source) {
                return;
            }

            playerShell.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                started = true;
            }

            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        playerShell.addEventListener('click', startPlayer);
    }
})();
