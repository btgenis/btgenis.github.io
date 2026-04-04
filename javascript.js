document.addEventListener("DOMContentLoaded", function () {

    // --- Element references with null guards ---
    const photosDiv = document.getElementById("photos");
    const logo = document.getElementById("logo");
    const tip = document.getElementById("tip");

    if (!photosDiv) {
        console.warn("javascript.js: #photos element not found. Aborting.");
        return;
    }

    const images = document.querySelectorAll(".grid img");
    const imagesSmallDiv = document.querySelectorAll(".img-wrapper");

    // --- Safe localStorage helpers ---
    function storageGet(key, fallback) {
        try {
            const val = localStorage.getItem(key);
            return val !== null ? val : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Silently fail (e.g. private browsing, storage full)
        }
    }

    // --- View mode ---
    function setViewMode(mode) {
        photosDiv.classList.remove("small", "big");
        photosDiv.classList.add(mode);
        storageSet("viewMode", mode);
    }

    const savedViewMode = storageGet("viewMode", "small");
    setViewMode(savedViewMode);

    // Load large images that are already visible on initial "big" load
    if (photosDiv.classList.contains("big")) {
        images.forEach(image => {
            const rect = image.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                loadLargeImage(image);
            }
        });
    }

    // --- Tip animation ---
    if (tip) {
        tip.addEventListener("animationend", () => {
            tip.classList.add("tipAnimationCompleted");
        });
    }

    // --- Smooth loading for small images ---
    imagesSmallDiv.forEach(div => {
        const img = div.querySelector("img");
        if (!img) return;

        function showLoadedImage() {
            div.classList.add("completed-loading-small");
        }

        if (img.complete) {
            showLoadedImage();
        } else {
            img.addEventListener("load", showLoadedImage);
        }
    });

    // --- Load large image ---
    function loadLargeImage(image) {
        const largeImageSrc = image.getAttribute("data-large");
        if (largeImageSrc && !image.classList.contains("loaded") && !image.classList.contains("initiated-loading")) {
            image.src = largeImageSrc;
            image.classList.add("initiated-loading");

            image.onload = function () {
                image.classList.remove("initiated-loading");
                image.classList.add("loaded");
            };

            image.onerror = function () {
                image.classList.remove("initiated-loading");
                console.warn("Failed to load large image:", largeImageSrc);
            };
        }
    }

    // --- Toggle view on click ---
    function toggleClassAndScroll(event) {
        // Walk up to the actual <img> in case of any future child elements
        const image = event.currentTarget;
        const newMode = photosDiv.classList.contains("small") ? "big" : "small";
        setViewMode(newMode);
        image.scrollIntoView({ behavior: "auto", block: "center" });
        if (newMode === "big") {
            loadLargeImage(image);
        }
        if (tip) {
            tip.classList.add("tipAnimationCompleted");
        }
    }

    // --- Intersection Observer for lazy-loading in big mode ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && photosDiv.classList.contains("big")) {
                loadLargeImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0.1
    });

    // --- Keyboard accessibility ---
    images.forEach(image => {
        // Make images focusable
        if (!image.hasAttribute("tabindex")) {
            image.setAttribute("tabindex", "0");
        }
        image.setAttribute("role", "button");

        image.addEventListener("click", toggleClassAndScroll);

        image.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleClassAndScroll(event);
            }
        });

        observer.observe(image);
    });

    // --- Logo resets to grid view ---
    if (logo) {
        logo.addEventListener("click", function () {
            setViewMode("small");
            window.scrollTo({ top: 0 });
        });
    }

});
