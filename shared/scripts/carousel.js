(function () {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');

    if (slides.length < 2) return;

    let currentIndex = 0;
    let fallbackTimer = null;
    const IMAGE_DURATION = 3000;

    function goToSlide(index) {
        if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }

        slides.forEach((slide, i) => {
            const isActive = i === index;
            slide.classList.toggle('active', isActive);

            const video = slide.querySelector('video');
            if (video) {
                if (isActive) {
                    video.currentTime = 0;
                    video.play().catch((err) => {
                        console.log('Video play error:', err);
                    });
                } else {
                    video.pause();
                }
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;

        const activeSlide = slides[index];
        const activeVideo = activeSlide.querySelector('video');

        if (!activeVideo) {
            fallbackTimer = setTimeout(() => {
                nextSlide();
            }, IMAGE_DURATION);
        }
    }

    function nextSlide() {
        const next = (currentIndex + 1) % slides.length;
        goToSlide(next);
    }

    // 'ended' events
    slides.forEach((slide) => {
        const video = slide.querySelector('video');
        if (video) {
            video.addEventListener('ended', () => {
                const slideIndex = Array.from(slides).indexOf(slide);
                if (slideIndex === currentIndex) {
                    nextSlide();
                }
            });
        }
    });

    // Start
    goToSlide(0);

    // Dots
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.slide, 10);
            goToSlide(index);
        });
    });

    // Pause videos when the page is hidden and play when visible
    document.addEventListener('visibilitychange', () => {
        const activeVideo = slides[currentIndex]?.querySelector('video');
        if (document.hidden) {
            if (activeVideo) activeVideo.pause();
        } else {
            if (activeVideo) activeVideo.play().catch(() => {});
        }
    });
})();