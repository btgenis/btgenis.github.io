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
                object-fit: cover;
            }
            .thumbnail {
                position: relative;
                z-index: 1;
                filter: blur(20px);
                transform: scale(1.1);
                transition: opacity 0.5s ease-out;
            }
            .high-res {
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0;
                z-index: 2;
                transition: opacity 0.5s ease-out, filter 0.5s ease-out, transform 0.5s ease-out;
                filter: blur(20px);
                transform: scale(1.1);
            }
            .high-res.reveal {
                opacity: 1;
                filter: blur(0);
                transform: scale(1);
            }
            .thumbnail.fade-out {
                opacity: 0;
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
                
                // Trigger the transition
                requestAnimationFrame(() => {
                    highResImage.classList.add('reveal');
                    image.classList.add('fade-out');
                });

                // Mark as loaded
                image.classList.add("loaded");
                
                // After transition, update the original image source
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
