// Carrusel de proyectos
class ProjectCarousel {
    constructor(selector) {
        // Validación del elemento
        this.carousel = document.querySelector(selector);
        if (!this.carousel) {
            console.error('Carousel element not found:', selector);
            return;
        }

        // Obtener elementos con validación
        this.track = this.carousel.querySelector('.carousel-track');
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.prevBtn = this.carousel.querySelector('.carousel-prev');
        this.nextBtn = this.carousel.querySelector('.carousel-next');
        this.indicators = this.carousel.querySelectorAll('.carousel-indicator');

        // Validar que todos los elementos existan
        if (!this.track || !this.prevBtn || !this.nextBtn) {
            console.error('Carousel elements missing. Check HTML structure');
            return;
        }

        this.currentIndex = 0;
        this.slideWidth = 0;
        this.resizeTimeout = null;
        this.isPaused = false;

        this.init();
    }

    init() {
        try {
            this.updateSlideWidth();
            this.attachEventListeners();
            window.addEventListener('resize', () => this.debouncedResize());
        } catch (error) {
            console.error('Carousel initialization failed:', error);
        }
    }

    updateSlideWidth() {
        if (!this.carousel) return;
        this.slideWidth = this.carousel.offsetWidth;
        this.updatePosition();
    }

    debouncedResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this.updateSlideWidth(), 300);
    }

    attachEventListeners() {
        if (!this.prevBtn || !this.nextBtn) {
            console.error('Navigation buttons not found');
            return;
        }

        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Soporte para teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    next() {
        if (this.isPaused) return;
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateCarousel();
    }

    prev() {
        if (this.isPaused) return;
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) {
            console.warn('Invalid slide index:', index);
            return;
        }
        this.currentIndex = index;
        this.updateCarousel();
    }

    updatePosition() {
        if (!this.track) return;
        const offset = -this.currentIndex * this.slideWidth;
        this.track.style.transform = `translateX(${offset}px)`;
    }

    updateCarousel() {
        this.updatePosition();
        this.updateIndicators();
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
            // Accesibilidad: actualizar aria-current
            indicator.setAttribute('aria-current', index === this.currentIndex ? 'true' : 'false');
        });
    }

    // Métodos públicos
    pause() {
        this.isPaused = true;
    }

    play() {
        this.isPaused = false;
    }

    getCurrentSlide() {
        return this.currentIndex;
    }

    getTotalSlides() {
        return this.slides.length;
    }

    destroy() {
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        // Aquí se podrían remover event listeners si fuera necesario
    }
}

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("carrusel-nav");
    const btnIzq = document.getElementById("btn-izq");
    const btnDer = document.getElementById("btn-der");

    if (!nav || !btnIzq || !btnDer) return;

    // Distancia en píxeles que rueda con cada clic
    const paso = 180;

    btnIzq.addEventListener("click", () => {
        nav.scrollBy({ left: -paso, behavior: "smooth" });
    });

    btnDer.addEventListener("click", () => {
        nav.scrollBy({ left: paso, behavior: "smooth" });
    });
});
