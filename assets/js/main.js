(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        let index = 0;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    const filterBox = document.querySelector("[data-filter-box]");
    const filterList = document.querySelector("[data-filter-list]");

    if (filterBox && filterList) {
        const keywordInput = filterBox.querySelector("[data-filter-keyword]");
        const yearSelect = filterBox.querySelector("[data-filter-year]");
        const typeSelect = filterBox.querySelector("[data-filter-type]");
        const cards = Array.from(filterList.querySelectorAll(".movie-card"));

        function applyFilter() {
            const keyword = (keywordInput.value || "").trim().toLowerCase();
            const year = yearSelect.value || "";
            const type = typeSelect.value || "";

            cards.forEach(function (card) {
                const text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchYear = !year || card.getAttribute("data-year") === year;
                const cardType = card.getAttribute("data-type") || "";
                const matchType = !type || cardType.indexOf(type) !== -1;
                card.style.display = matchKeyword && matchYear && matchType ? "" : "none";
            });
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (node) {
            node.addEventListener("input", applyFilter);
            node.addEventListener("change", applyFilter);
        });
    }

    const searchResults = document.querySelector("[data-search-results]");
    if (searchResults && window.SEARCH_ITEMS) {
        const form = document.querySelector("[data-search-form]");
        const input = document.querySelector("[data-search-input]");
        const yearSelect = document.querySelector("[data-search-year]");
        const typeSelect = document.querySelector("[data-search-type]");
        const params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        const years = Array.from(new Set(window.SEARCH_ITEMS.map(function (item) {
            return String(item.year);
        }))).sort(function (a, b) {
            return Number(b) - Number(a);
        });

        const types = Array.from(new Set(window.SEARCH_ITEMS.map(function (item) {
            return item.type;
        }).filter(Boolean))).sort();

        years.forEach(function (year) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        types.forEach(function (type) {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        function cardTemplate(item) {
            const tags = item.tags.slice(0, 4).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<article class=\"movie-card\">" +
                "<a class=\"poster\" href=\"" + item.page + "\">" +
                    "<img src=\"./" + item.cover + ".jpg\" alt=\"" + escapeHtml(item.title) + "\">" +
                    "<span class=\"poster-year\">" + item.year + "</span>" +
                    "<span class=\"poster-play\">▶</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                    "<h3><a href=\"" + item.page + "\">" + escapeHtml(item.title) + "</a></h3>" +
                    "<p class=\"meta-line\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>" +
                    "<p class=\"card-desc\">" + escapeHtml(item.oneLine) + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>\"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function renderSearch() {
            const keyword = (input.value || "").trim().toLowerCase();
            const year = yearSelect.value || "";
            const type = typeSelect.value || "";
            const matches = window.SEARCH_ITEMS.filter(function (item) {
                const text = [item.title, item.region, item.type, item.genre, item.oneLine, item.tags.join(" ")].join(" ").toLowerCase();
                const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchYear = !year || String(item.year) === year;
                const matchType = !type || item.type === type;
                return matchKeyword && matchYear && matchType;
            }).slice(0, 120);

            if (!matches.length) {
                searchResults.innerHTML = "<div class=\"empty-state\">暂无匹配内容</div>";
                return;
            }

            searchResults.innerHTML = matches.map(cardTemplate).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const params = new URLSearchParams();
            if (input.value.trim()) {
                params.set("q", input.value.trim());
            }
            const nextUrl = params.toString() ? "search.html?" + params.toString() : "search.html";
            window.history.replaceState(null, "", nextUrl);
            renderSearch();
        });

        [input, yearSelect, typeSelect].forEach(function (node) {
            node.addEventListener("input", renderSearch);
            node.addEventListener("change", renderSearch);
        });

        renderSearch();
    }
}());
