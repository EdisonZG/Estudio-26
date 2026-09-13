// Carrusel de proyectos
class ProjectCarousel {
    constructor(selector) {
        this.carousel = document.querySelector(selector);
        this.track = this.carousel.querySelector('.carousel-track');
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.prevBtn = this.carousel.querySelector('.carousel-prev');
        this.nextBtn = this.carousel.querySelector('.carousel-next');
        this.indicators = this.carousel.querySelectorAll('.carousel-indicator');
        
        this.currentIndex = 0;
        this.slideWidth = 0;
        
        this.init();
    }
    
    init() {
        this.updateSlideWidth();
        this.attachEventListeners();
        window.addEventListener('resize', () => this.updateSlideWidth());
    }
    
    updateSlideWidth() {
        this.slideWidth = this.carousel.offsetWidth;
        this.updatePosition();
    }
    
    attachEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateCarousel();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    updatePosition() {
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
        });
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    new ProjectCarousel('.projects-carousel');
});
