class AeroScan {
    constructor() {
        this.init();
    }

    init() {
        this.hidePreloader();
        this.setupNavigation();
        this.setupAnimations();
        this.setupEventListeners();
        this.createParticles();
        this.startStatsAnimation();
        this.setupPricingCarousel();
    }

    hidePreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1000);
            }, 2000);
        });
    }

    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
                navToggle.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        // Observe elements for animation
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Add fade-in class to elements
        this.addFadeInClass('.service-card');
        this.addFadeInClass('.tech-feature');
        this.addFadeInClass('.stat');
    }

    addFadeInClass(selector) {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    setupPricingCarousel() {
        const carousel = document.getElementById('pricingCarousel');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        const dotsContainer = document.getElementById('carouselDots');
    
        if (!carousel) return;
    
        const cards = carousel.querySelectorAll('.pricing-card');
        const cardCount = cards.length;
        let currentIndex = 0;
        let autoSlideInterval;
    
    // Рассчитываем сколько карточек видно
        const getVisibleCards = () => {
            const width = window.innerWidth;
            if (width < 768) return 1;
            if (width < 1024) return 2;
            return 3;
        };
    
    // Создаем точки
        cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
    
    // Функция обновления карусели
        const updateCarousel = () => {
            const cardWidth = cards[0].offsetWidth + 32; // ширина карточки + gap
            const translateX = -currentIndex * cardWidth;
            carousel.style.transform = `translateX(${translateX}px)`;
        
        // Обновляем точки
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        
        // Обновляем состояние кнопок
            if (prevBtn) {
                prevBtn.disabled = currentIndex === 0;
                prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            }
        
            if (nextBtn) {
                const visibleCards = getVisibleCards();
                nextBtn.disabled = currentIndex >= cardCount - visibleCards;
                nextBtn.style.opacity = currentIndex >= cardCount - visibleCards ? '0.5' : '1';
            }
        };
    
    // Функция перехода к слайду
        const goToSlide = (index) => {
            currentIndex = index;
            updateCarousel();
            resetAutoSlide();
        };
    
    // Функция следующего слайда
        const nextSlide = () => {
            const visibleCards = getVisibleCards();
            if (currentIndex < cardCount - visibleCards) {
                currentIndex++;
            } else {
                currentIndex = 0; // Возврат к началу
            }
            updateCarousel();
        };
    
    // Функция предыдущего слайда
        const prevSlide = () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                const visibleCards = getVisibleCards();
                currentIndex = cardCount - visibleCards; // Переход к концу
            }
            updateCarousel();
        };
    
    // Автопрокрутка
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, 4000); // 4 секунды
        };
    
        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };
    
    // Обработчики событий
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoSlide();
            });
        }
    
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoSlide();
            });
        }
    
    // Обработчик ресайза
        window.addEventListener('resize', () => {
            updateCarousel();
        });
    
    // Инициализация
        updateCarousel();
        startAutoSlide();
    
    // Пауза при наведении
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
    
        carousel.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
    setupEventListeners() {
        // CTA buttons
        const consultBtn = document.getElementById('consultBtn');
        const heroCta = document.getElementById('heroCta');
        const ctaForm = document.getElementById('ctaForm');

        if (consultBtn) {
            consultBtn.addEventListener('click', () => {
                this.scrollToSection('contact');
            });
        }

        if (heroCta) {
            heroCta.addEventListener('click', () => {
                this.scrollToSection('contact');
            });
        }

        if (ctaForm) {
            ctaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(ctaForm);
            });
        }

        // Watch video button
        const watchVideo = document.getElementById('watchVideo');
        if (watchVideo) {
            watchVideo.addEventListener('click', () => {
                this.showVideoModal();
            });
        }

        // Service card interactions
        document.querySelectorAll('.service-cta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.service-card');
                this.animateServiceCard(card);
            });
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    createParticles() {
        const particlesContainer = document.getElementById('heroParticles');
        if (!particlesContainer) return;

        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.3});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;

            particlesContainer.appendChild(particle);
        }

        // Add CSS for particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    startStatsAnimation() {
        const stats = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    animateServiceCard(card) {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    }

    showVideoModal() {
        // In a real implementation, you would show a modal with video
        alert('Здесь будет демонстрационное видео наших услуг');
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Спасибо! Мы свяжемся с вами в ближайшее время для расчета стоимости.');
        form.reset();
    }

}

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
    new AeroScan();
});

// Additional animations for drone in technology section
const droneModel = document.getElementById('droneModel');
if (droneModel) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        droneModel.style.transform = `translate(${x}px, ${y}px) rotate(${x}deg)`;
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-background');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});