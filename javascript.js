document.addEventListener("DOMContentLoaded", function() {
    const photosDiv = document.getElementById("photos");
    const images = document.querySelectorAll(".grid img");
    const imagesSmallDiv = document.querySelectorAll(".small .img-wrapper");

    // check the saved view mode and apply it
    const savedViewMode = localStorage.getItem('viewMode') || 'small'; // Set default view mode
    setViewMode(savedViewMode);
    images.forEach(image => {
        const rect = image.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0 && photosDiv.classList.contains("big")) {
            loadLargeImage(image);
        }
    });

    // Displaying the tip
    const tip = document.getElementById('tip');
    tip.addEventListener('animationend', () => {
        tip.classList.add('tipAnimationCompleted');
    });

    // Smooth loading small images
    imagesSmallDiv.forEach(div => {
        const img = div.querySelector("img");

        function showLoadedImage() {
            div.classList.add("completed-loading-small");
        }

        if (img.complete) {
            showLoadedImage();
        } else {
            img.addEventListener("load", showLoadedImage);
        }
    });

    // Function to load large image
    function loadLargeImage(image) {
        const largeImageSrc = image.getAttribute("data-large");
        if (largeImageSrc && !image.classList.contains("loaded")) {
            image.src = largeImageSrc;
            image.classList.add("initiated-loading");

            // Add the class "loaded" only after it finishes loading
            image.onload = function() {
                image.classList.remove("initiated-loading");
                image.classList.add("loaded");
            };
        }
    }

    // Function to set the view mode and save to localStorage
    function setViewMode(mode) {
        photosDiv.classList.remove('small', 'big');
        photosDiv.classList.add(mode);
        localStorage.setItem('viewMode', mode);
    }

    // Function to toggle between small and big classes
    function toggleClassAndScroll(event) {
        const newMode = photosDiv.classList.contains('small') ? 'big' : 'small';
        setViewMode(newMode);
        event.target.scrollIntoView({ behavior: 'auto', block: 'center' });
        loadLargeImage(event.target);  // Load large image when toggling
        tip.classList.add('tipAnimationCompleted');
    }

    // Set up Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && photosDiv.classList.contains("big")) {
                loadLargeImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1
    });

    // Start observing each image
    images.forEach(image => {
        image.addEventListener('click', toggleClassAndScroll);
        observer.observe(image);
    });
});