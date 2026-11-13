(() => {
    "use strict";

    /* =========================
       TOAST HELPER
    ========================= */
    const toastEl = document.getElementById("toast");
    let toastTimer = null;

    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add("visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove("visible");
        }, 2600);
    }

    /* =========================
       THEME TOGGLE (LIGHT / DARK)
    ========================= */
    const themeToggle = document.getElementById("theme-toggle");
    const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        if (themeToggle) {
            themeToggle.innerHTML = theme === "dark" ? sunIcon : moonIcon;
            themeToggle.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
            themeToggle.setAttribute(
                "title",
                theme === "dark" ? "Light mode" : "Dark mode"
            );
        }
    }

    const savedTheme = localStorage.getItem("blog-theme");
    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current =
                document.documentElement.getAttribute("data-theme") || "light";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
            localStorage.setItem("blog-theme", next);
            showToast(next === "dark" ? "Dark mode enabled" : "Light mode enabled");
        });
    }

    /* =========================
       MOBILE NAVIGATION DRAWER
    ========================= */
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mainNav.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        mainNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", (e) => {
            if (
                mainNav.classList.contains("open") &&
                !mainNav.contains(e.target) &&
                !menuToggle.contains(e.target)
            ) {
                mainNav.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && mainNav.classList.contains("open")) {
                mainNav.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.focus();
            }
        });
    }

    /* =========================
       HOMEPAGE SEARCH & FILTER
    ========================= */
    const searchInput = document.getElementById("article-search");
    const searchClear = document.getElementById("search-clear");
    const filterPills = document.querySelectorAll(".filter-pill");
    const articleCards = document.querySelectorAll(".article-card");
    const articleCount = document.getElementById("article-count");
    const emptyState = document.getElementById("empty-state");
    const resetFiltersBtn = document.getElementById("reset-filters");

    let activeCategory = "all";
    let searchQuery = "";

    function updateArticles() {
        if (!articleCards.length) return;
        let visibleCount = 0;

        articleCards.forEach((card) => {
            const cardCat = (card.dataset.category || "").toLowerCase();
            const cardText = card.textContent.toLowerCase();

            const matchesCategory =
                activeCategory === "all" || cardCat === activeCategory;
            const matchesSearch =
                !searchQuery || cardText.includes(searchQuery);

            const show = matchesCategory && matchesSearch;
            card.classList.toggle("is-hidden", !show);
            if (show) visibleCount++;
        });

        if (articleCount) {
            articleCount.textContent = `${visibleCount} ${
                visibleCount === 1 ? "article" : "articles"
            }`;
        }

        if (emptyState) {
            emptyState.classList.toggle("visible", visibleCount === 0);
        }
    }

    if (filterPills.length) {
        filterPills.forEach((pill) => {
            pill.addEventListener("click", () => {
                filterPills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                activeCategory = pill.dataset.filter || "all";
                updateArticles();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchQuery = searchInput.value.trim().toLowerCase();
            if (searchClear) {
                searchClear.classList.toggle("visible", searchQuery.length > 0);
            }
            updateArticles();
        });

        document.addEventListener("keydown", (e) => {
            if (
                e.key === "/" &&
                document.activeElement !== searchInput &&
                !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
            ) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    if (searchClear && searchInput) {
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            searchQuery = "";
            searchClear.classList.remove("visible");
            updateArticles();
            searchInput.focus();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            activeCategory = "all";
            searchQuery = "";
            if (searchInput) searchInput.value = "";
            if (searchClear) searchClear.classList.remove("visible");
            filterPills.forEach((p) =>
                p.classList.toggle("active", p.dataset.filter === "all")
            );
            updateArticles();
        });
    }

    // Coming soon card interaction
    document.querySelectorAll("[data-coming-soon]").forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            showToast("This article is being written — check back soon!");
        });
    });

    /* =========================
       ARTICLE READING FEATURES
    ========================= */
    const fullArticle = document.querySelector(".full-article");
    const progressBar = document.getElementById("reading-progress");

    if (fullArticle) {
        // Auto reading time
        const readTimeEl = document.getElementById("article-read-time");
        if (readTimeEl) {
            const words = fullArticle.innerText.trim().split(/\s+/).length;
            const minutes = Math.max(1, Math.ceil(words / 200));
            readTimeEl.textContent = `${minutes} min read`;
        }

        // Auto Table of Contents for articles with 3+ h3 headings
        const headings = fullArticle.querySelectorAll("h3");
        const tocContainer = document.getElementById("article-toc");
        if (tocContainer && headings.length >= 3) {
            const list = document.createElement("ul");
            list.className = "toc-list";

            headings.forEach((heading, idx) => {
                if (!heading.id) {
                    heading.id = `section-${idx + 1}`;
                }
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `#${heading.id}`;
                a.textContent = heading.textContent.trim();
                li.appendChild(a);
                list.appendChild(li);
            });

            const toggleBtn = document.createElement("button");
            toggleBtn.type = "button";
            toggleBtn.className = "toc-toggle";
            toggleBtn.setAttribute("aria-expanded", "true");
            toggleBtn.innerHTML = `<span>In this article</span><span aria-hidden="true">▾</span>`;
            toggleBtn.addEventListener("click", () => {
                const collapsed = tocContainer.classList.toggle("collapsed");
                toggleBtn.setAttribute("aria-expanded", String(!collapsed));
            });

            tocContainer.appendChild(toggleBtn);
            tocContainer.appendChild(list);
            tocContainer.hidden = false;
        }
    }

    // Reading progress bar on scroll
    if (progressBar && fullArticle) {
        const updateProgress = () => {
            const rect = fullArticle.getBoundingClientRect();
            const totalScrollable = fullArticle.offsetHeight - window.innerHeight * 0.6;
            const scrolled = Math.max(0, -rect.top + 80);
            const pct =
                totalScrollable > 0
                    ? Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100))
                    : 0;
            progressBar.style.width = `${pct}%`;
        };
        window.addEventListener("scroll", updateProgress, { passive: true });
        updateProgress();
    }

    // Copy / Share link button
    const shareBtn = document.getElementById("share-article");
    if (shareBtn) {
        shareBtn.addEventListener("click", async () => {
            const url = window.location.href;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(url);
                    showToast("Article link copied to clipboard!");
                } else {
                    showToast("Copy the URL from your address bar.");
                }
            } catch {
                showToast("Could not copy link.");
            }
        });
    }

    /* =========================
       BACK TO TOP BUTTON
    ========================= */
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
        window.addEventListener(
            "scroll",
            () => {
                backToTopBtn.classList.toggle("visible", window.scrollY > 320);
            },
            { passive: true }
        );

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();
