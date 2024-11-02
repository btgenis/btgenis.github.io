document.addEventListener("DOMContentLoaded", function() {
    const photosDiv = document.getElementById("photos");
    const images = document.querySelectorAll(".grid img");

    // Add necessary styles for the blur transition
    if (!document.querySelector('#blur-animation')) {
        const style = document.createElement('style');
        style.id = 'blur-animation';
        style.textContent = `
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
                left: 0;
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

                // Mark as loaded
                image.classList.add("loaded");
                
                // Clean up after transition
                setTimeout(() => {
                    image.src = largeImageSrc;
                    image.classList.remove('thumbnail', 'fade-out');
                    wrapper.removeChild(highResImage);
                }, 500);
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
        if (newMode === 'big') {
            loadLargeImage(event.target);
        }
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
        if (savedViewMode === 'big') {
            images.forEach(image => {
                const rect = image.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom >= 0) {
                    loadLargeImage(image);
                }
            });
        }
    });
});
