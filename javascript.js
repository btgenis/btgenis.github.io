document.addEventListener("DOMContentLoaded", function() {
    const photosDiv = document.getElementById("photos");
    const images = document.querySelectorAll(".grid img");

    // Add necessary styles for the blur transition
    if (!document.querySelector('#blur-animation')) {
        const style = document.createElement('style');
        style.id = 'blur-animation';
        style.textContent = `
            .img-wrapper {
                position: relative;
                overflow: hidden;
            }
            .img-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .thumbnail {
                position: relative;
                z-index: 1;
                filter: blur(20px);
                -webkit-transition: 0.5s -webkit-filter linear;
                -moz-transition: 0.5s -moz-filter linear;
                -moz-transition: 0.5s filter linear;
                -ms-transition: 0.5s -ms-filter linear;
                -o-transition: 0.5s -o-filter linear;
                transition: 0.5s filter linear, 0.5s -webkit-filter linear;
            }
            .high-res {
                position: absolute;
                top: 0;
                right: 0;
                opacity: 0;
                z-index: 2;
                filter: blur(20px);
                -webkit-transition: 0.5s -webkit-filter linear;
                -moz-transition: 0.5s -moz-filter linear;
                -moz-transition: 0.5s filter linear;
                -ms-transition: 0.5s -ms-filter linear;
                -o-transition: 0.5s -o-filter linear;
                transition: 0.5s filter linear, 0.5s -webkit-filter linear;
            }
        `;
        document.head.appendChild(style);
    }

    // Function to load large image when clicked
    function loadLargeImage(image) {
        const largeImageSrc = image.getAttribute("data-large");
        if (largeImageSrc && !image.classList.contains("loaded")) {
            const wrapper = image.closest('.img-wrapper');
            
            // Set up the thumbnail
            image.classList.add('thumbnail');
            
            // Create and load the high-res image
            const highResImage = new Image();
            highResImage.className = 'high-res';
            highResImage.src = largeImageSrc;
            highResImage.alt = image.alt;
            
            // Only proceed with transition once the high-res image is loaded
            highResImage.onload = function() {
                wrapper.appendChild(highResImage);
                
                // Force browser reflow
                highResImage.offsetHeight;
                
                // Start with both images blurred
                requestAnimationFrame(() => {
                    // First make the high-res image visible but still blurred
                    highResImage.style.opacity = '1';
                    
                    // Wait a frame to ensure opacity is applied
                    requestAnimationFrame(() => {
                        // Now unblur both images simultaneously
                        highResImage.style.filter = 'blur(0)';
                        image.style.filter = 'blur(0)';
                    });
                });

                // Clean up after transition
                setTimeout(() => {
                    image.src = largeImageSrc;
                    image.classList.remove('thumbnail');
                    wrapper.removeChild(highResImage);
                }, 500);

                // Mark as loaded
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

    // On page load, check the saved view mode and apply it
    window.addEventListener('load', () => {
        const savedViewMode = localStorage.getItem('viewMode') || 'small';
        setViewMode(savedViewMode);
        images.forEach(image => {
            const rect = image.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0 && photosDiv.classList.contains("big")) {
                loadLargeImage(image);
            }
        });
    });
});
