class AeroScan {
    constructor() {
        this.currentService = 'monitoring';
        this.currentPrice = 15000;
        this.calculatorData = {
            area: 10000, // в квадратных метрах
            height: 120,
            stage: 1.0,
            frequency: 1,
            terrain: 1.0,
            urgency: 1.0
        };
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupAnimations();
        this.setupEventListeners();
        this.createParticles();
        this.startStatsAnimation();
        this.setupPricingCarousel();
        this.setupCalculator();
    }

    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isVisible = navMenu.style.display === 'flex';
                navMenu.style.display = isVisible ? 'none' : 'flex';
                navToggle.classList.toggle('active');
            });
        }

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
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

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
        const dotsContainer = document.getElementById('carouselDots');
    
        if (!carousel || !dotsContainer) return;
    
        const cards = carousel.querySelectorAll('.pricing-card');
        const cardCount = cards.length;
        let currentIndex = 0;
        let autoSlideInterval;
    
        const getVisibleCards = () => {
            const width = window.innerWidth;
            if (width < 768) return 1;
            if (width < 1024) return 2;
            return 3;
        };
    
        cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
    
        const updateCarousel = () => {
            const cardWidth = cards[0].offsetWidth + 32;
            const translateX = -currentIndex * cardWidth;
            carousel.style.transform = `translateX(${translateX}px)`;
        
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        };
    
        this.goToSlide = (index) => {
            currentIndex = index;
            updateCarousel();
            this.resetAutoSlide();
        };
    
        const nextSlide = () => {
            const visibleCards = getVisibleCards();
            if (currentIndex < cardCount - visibleCards) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        };
    
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(nextSlide, 4000);
        };
    
        this.resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };
    
        window.addEventListener('resize', () => {
            updateCarousel();
        });
    
        updateCarousel();
        startAutoSlide();
    
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
    
        carousel.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }

    setupCalculator() {
        // Service selection
        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.service-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                this.currentService = option.dataset.service;
                this.currentPrice = parseInt(option.dataset.price);
                this.updateServiceDisplay();
                this.calculateTotal();
            });
        });

        // Area slider (в квадратных метрах)
        this.setupSlider('areaSize', 'areaValue', 'area', value => {
            if (value >= 10000) {
                return `${(value / 10000).toFixed(1)} га`;
            }
            return `${value.toLocaleString('ru-RU')} м²`;
        });

        // Height slider
        this.setupSlider('flightHeight', 'heightValue', 'height', value => `${value} м`);

        // Frequency slider
        this.setupSlider('shootingFrequency', 'frequencyValue', 'frequency', value => {
            return `${value} ${this.getTimesText(value)}`;
        });

        // Stage select
        this.setupSelect('projectStage', 'stage');

        // Terrain select
        this.setupSelect('terrainType', 'terrain');

        // Urgency select
        this.setupSelect('urgency', 'urgency');

        // Order button
        const orderBtn = document.getElementById('orderBtn');
        if (orderBtn) {
            orderBtn.addEventListener('click', () => {
                this.scrollToSection('contact');
            });
        }

        // Initialize calculator
        this.updateServiceDisplay();
        this.calculateTotal();
    }

    setupSlider(sliderId, valueId, dataKey, formatCallback) {
        const slider = document.getElementById(sliderId);
        const valueElement = document.getElementById(valueId);
        
        if (slider && valueElement) {
            // Initial value
            valueElement.textContent = formatCallback(parseInt(slider.value));
            
            // Input event with debouncing
            let timeout;
            slider.addEventListener('input', () => {
                const value = parseInt(slider.value);
                this.calculatorData[dataKey] = value;
                
                // Update value display with animation
                valueElement.textContent = formatCallback(value);
                valueElement.classList.add('updating');
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    valueElement.classList.remove('updating');
                }, 300);
                
                // Calculate total
                this.calculateTotal();
            });
        }
    }

    setupSelect(selectId, dataKey) {
        const select = document.getElementById(selectId);
        if (select) {
            select.addEventListener('change', () => {
                this.calculatorData[dataKey] = parseFloat(select.value);
                this.calculateTotal();
            });
        }
    }

    getTimesText(times) {
        if (times === 1) return 'раз';
        if (times >= 2 && times <= 4) return 'раза';
        return 'раз';
    }

    updateServiceDisplay() {
        const serviceNames = {
            monitoring: 'Мониторинг строительства',
            topographic: 'Топографическая съемка',
            scanning: 'Лазерное сканирование'
        };
        
        const resultService = document.getElementById('resultService');
        if (resultService) {
            resultService.textContent = serviceNames[this.currentService] || 'Мониторинг строительства';
        }
    }

    calculateTotal() {
        // Base cost from selected service
        let baseCost = this.currentPrice;
        
        // Area cost calculation (в квадратных метрах)
        let areaCost = 0;
        const areaInSquareMeters = this.calculatorData.area;
        
        if (areaInSquareMeters > 50000) { // свыше 50 000 м²
            areaCost = (areaInSquareMeters - 50000) / 1000 * 200; // 200 руб за 1000 м²
        }
        if (areaInSquareMeters > 10000) { // от 10 000 до 50 000 м²
            areaCost += Math.min(areaInSquareMeters - 10000, 40000) / 1000 * 100; // 100 руб за 1000 м²
        }
        
        // Height adjustment (higher flight = more complex)
        let heightMultiplier = 1.0;
        if (this.calculatorData.height > 300) heightMultiplier = 1.4;
        else if (this.calculatorData.height > 200) heightMultiplier = 1.2;
        else if (this.calculatorData.height > 100) heightMultiplier = 1.1;
        
        // Calculate additional costs
        let terrainCost = baseCost * (this.calculatorData.terrain - 1);
        let stageCost = baseCost * (this.calculatorData.stage - 1);
        let urgencyCost = baseCost * (this.calculatorData.urgency - 1);
        
        // Total per flight (with height multiplier)
        let totalPerFlight = (baseCost + areaCost + terrainCost + stageCost + urgencyCost) * heightMultiplier;
        
        // Total cost (per flight * frequency)
        let totalCost = totalPerFlight * this.calculatorData.frequency;
        
        // Format currency function
        const formatCurrency = (amount) => {
            return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
        };

        // Update UI with animations
        this.updateCostElement('baseCost', formatCurrency(baseCost));
        this.updateCostElement('areaCost', formatCurrency(areaCost));
        this.updateCostElement('terrainCost', formatCurrency(terrainCost));
        this.updateCostElement('stageCost', formatCurrency(stageCost));
        this.updateCostElement('urgencyCost', formatCurrency(urgencyCost));
        this.updateCostElement('totalPerFlight', formatCurrency(totalPerFlight));
        this.updateCostElement('totalCost', formatCurrency(totalCost));
    }

    updateCostElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element && element.textContent !== value) {
            element.classList.remove('price-updated');
            void element.offsetWidth; // Trigger reflow
            element.classList.add('price-updated');
            element.textContent = value;
        }
    }

    setupEventListeners() {
        const consultBtn = document.getElementById('consultBtn');
        const heroCta = document.getElementById('heroCta');
        const ctaForm = document.getElementById('ctaForm');
        const watchVideo = document.getElementById('watchVideo');

        if (consultBtn) {
            consultBtn.addEventListener('click', () => {
                this.scrollToSection('contact');
            });
        }

        if (heroCta) {
            heroCta.addEventListener('click', () => {
                this.scrollToSection('calculator');
            });
        }

        if (ctaForm) {
            ctaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(ctaForm);
            });
        }

        if (watchVideo) {
            watchVideo.addEventListener('click', () => {
                this.showVideoModal();
            });
        }

        document.querySelectorAll('.service-cta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.service-card');
                this.animateServiceCard(card);
            });
        });

        document.querySelectorAll('.pricing-card .btn-primary').forEach(btn => {
            btn.addEventListener('click', () => {
                this.scrollToSection('contact');
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

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.2});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 15 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;

            particlesContainer.appendChild(particle);
        }

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

        stats.forEach(stat => {
            if (stat.hasAttribute('data-target')) {
                observer.observe(stat);
            }
        });
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
        if (!card) return;
        
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    }

    showVideoModal() {
        alert('Здесь будет демонстрационное видео наших услуг');
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        console.log('Form submitted:', data);
        
        alert('Спасибо! Мы свяжемся с вами в ближайшее время для расчета стоимости.');
        form.reset();
    }
}

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
    new AeroScan();
});
