(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = (next) => {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach((slide, index) => {
                slide.classList.toggle('is-active', index === current);
            });
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === current);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        if (slides.length > 1) {
            setInterval(() => showSlide(current + 1), 5200);
        }
    }

    const searchInputs = Array.from(document.querySelectorAll('[data-movie-search]'));
    const yearFilters = Array.from(document.querySelectorAll('[data-year-filter]'));
    const lists = Array.from(document.querySelectorAll('[data-movie-list]'));

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilters = () => {
        const query = normalize(searchInputs.map((input) => input.value).find(Boolean) || '');
        const year = yearFilters.map((select) => select.value).find(Boolean) || '';

        lists.forEach((list) => {
            const cards = Array.from(list.children);
            cards.forEach((card) => {
                const pool = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.textContent
                ].join(' '));
                const matchesQuery = !query || pool.includes(query);
                const matchesYear = !year || card.dataset.year === year || pool.includes(year);
                card.classList.toggle('is-filtered-out', !(matchesQuery && matchesYear));
            });
        });
    };

    searchInputs.forEach((input) => input.addEventListener('input', applyFilters));
    yearFilters.forEach((select) => select.addEventListener('change', applyFilters));

    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('.play-overlay');
        const src = player.getAttribute('data-src');
        let ready = false;
        let hls = null;

        const prepare = () => {
            if (!video || ready || !src) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }

            ready = true;
        };

        const play = () => {
            prepare();
            if (video) {
                const promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(() => {});
                }
            }
            if (button) {
                button.classList.add('is-hidden');
            }
        };

        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        player.addEventListener('click', (event) => {
            if (!ready || event.target === button) {
                play();
            }
        });

        if (video) {
            video.addEventListener('play', () => {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', () => {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', () => {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        }
    });
})();
