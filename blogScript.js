document.addEventListener("DOMContentLoaded", function () {
    const postsContainer = document.getElementById("posts-container");

    document.addEventListener("click", function (event) {
        const isSmall = postsContainer.classList.contains("small");
        const isBig = postsContainer.classList.contains("big");

        if (isSmall) {
            // In "small" view: clicking on a .post switches to "big"
            const post = event.target.closest(".post");
            if (!post) return;

            postsContainer.classList.remove("small");
            postsContainer.classList.add("big");

            // Remove active from all posts
            document.querySelectorAll(".post.active").forEach(p => p.classList.remove("active"));

            // Add active to the clicked post
            post.classList.add("active");

            post.scrollIntoView({ block: "start" });
        } 
        else if (isBig) {
            // In "big" view: only .close-button  switches back to "small"
            const closeButton = event.target.closest(".close-button");
            if (!closeButton) return;

            postsContainer.classList.remove("big");
            postsContainer.classList.add("small");

            // Remove all active classes in small mode
            document.querySelectorAll(".post.active").forEach(p => p.classList.remove("active"));

            const post = closeButton.closest(".post");
            if (post) {
                post.scrollIntoView({ block: "start" });
            }
        }
        else {
            // If no class yet, default to "big" when clicking a .post
            const post = event.target.closest(".post");
            if (post) {
                postsContainer.classList.add("big");

                // Remove active from all posts
                document.querySelectorAll(".post.active").forEach(p => p.classList.remove("active"));

                // Add active to clicked
                post.classList.add("active");

                post.scrollIntoView({ block: "start" });
            }
        }
    });
});
