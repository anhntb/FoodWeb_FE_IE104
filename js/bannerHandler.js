document.addEventListener('DOMContentLoaded', function () {
    const bannerImages = document.querySelectorAll('.banner-images img');
    const dotsContainer = document.querySelector('.banner-dots');
    let currentSlide = 0;
    const totalSlides = bannerImages.length;
    let slideInterval;

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    function updateDots() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function updateSlides() {
        bannerImages.forEach((img, index) => {
            img.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlides();
        updateDots();
        resetInterval();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlide);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
    }

    bannerImages[0].classList.add('active');

    resetInterval();

    bannerImages.forEach(img => {
        img.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        img.addEventListener('mouseleave', resetInterval);
    });
});
