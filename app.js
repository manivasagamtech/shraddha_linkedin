// DOM Elements
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link');
const testimonialTrack = document.getElementById('testimonial-track');
const testimonialSlides = document.querySelectorAll('.testimonial__slide');
const testimonialIndicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const contactForm = document.getElementById('contact-form');
const successModal = document.getElementById('success-modal');
const modalClose = document.querySelector('.modal__close');

// Global Variables
let currentSlide = 0;
let autoSlideInterval;
let isSubmitting = false;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
    initStickyHeader();
    initMobileNavigation();
    initTestimonialCarousel();
    initFormValidation();
    initScrollAnimations();
    initParallaxEffects();
    initModalHandlers();
    initServiceCardClicks();
    initStatsCounter();
    initImageErrorHandling();
});

// Smooth Scrolling Navigation
function initSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
                
                // Update active nav link
                updateActiveNavLink(targetId);
            }
        });
    });
}

// Update Active Navigation Link
function updateActiveNavLink(targetId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Sticky Header
function initStickyHeader() {
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Update active section in navigation
        updateActiveSection();
    });
}

// Update Active Section Based on Scroll Position
function updateActiveSection() {
    const sections = document.querySelectorAll('.section');
    const headerHeight = header.offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const currentScroll = window.scrollY;
        
        if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
            const sectionId = '#' + section.getAttribute('id');
            updateActiveNavLink(sectionId);
        }
    });
}

// Mobile Navigation
function initMobileNavigation() {
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
    
    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Testimonial Carousel
function initTestimonialCarousel() {
    if (!testimonialSlides.length) return;
    
    // Initialize carousel
    showSlide(0);
    startAutoSlide();
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            stopAutoSlide();
            previousSlide();
            startAutoSlide();
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        });
    }
    
    // Indicator buttons
    testimonialIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            stopAutoSlide();
            showSlide(index);
            startAutoSlide();
        });
    });
    
    // Pause auto-slide on hover
    const carousel = document.querySelector('.testimonial__carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
}

function showSlide(index) {
    // Hide all slides
    testimonialSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    if (testimonialSlides[index]) {
        testimonialSlides[index].classList.add('active');
    }
    
    // Update indicators
    testimonialIndicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % testimonialSlides.length;
    showSlide(currentSlide);
}

function previousSlide() {
    currentSlide = currentSlide === 0 ? testimonialSlides.length - 1 : currentSlide - 1;
    showSlide(currentSlide);
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Form Validation and Submission
function initFormValidation() {
    if (!contactForm) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('.form__submit');
    
    // Real-time validation
    if (nameInput) nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
    if (emailInput) emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
    if (messageInput) messageInput.addEventListener('blur', () => validateField(messageInput, 'message'));
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        // Validate all fields
        const isNameValid = validateField(nameInput, 'name');
        const isEmailValid = validateField(emailInput, 'email');
        const isMessageValid = validateField(messageInput, 'message');
        
        if (isNameValid && isEmailValid && isMessageValid) {
            submitForm(submitBtn);
        }
    });
}

function validateField(field, type) {
    if (!field) return true;
    
    const errorElement = document.getElementById(`${field.id}-error`);
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    if (errorElement) {
        errorElement.textContent = '';
    }
    field.classList.remove('error');
    
    // Validation logic
    switch (type) {
        case 'name':
            if (!field.value.trim()) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (field.value.trim().length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!field.value.trim()) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(field.value.trim())) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;
            
        case 'message':
            if (!field.value.trim()) {
                errorMessage = 'Message is required';
                isValid = false;
            } else if (field.value.trim().length < 10) {
                errorMessage = 'Message must be at least 10 characters';
                isValid = false;
            }
            break;
    }
    
    // Display error if invalid
    if (!isValid) {
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        field.classList.add('error');
    }
    
    return isValid;
}

function submitForm(submitBtn) {
    isSubmitting = true;
    
    // Show loading state
    const btnText = submitBtn.querySelector('.btn__text');
    const btnSpinner = submitBtn.querySelector('.btn__spinner');
    
    if (btnText) btnText.style.opacity = '0';
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Reset form
        contactForm.reset();
        
        // Hide loading state
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
        submitBtn.disabled = false;
        isSubmitting = false;
        
        // Show success modal
        showSuccessModal();
    }, 2000);
}

// Modal Handlers
function initModalHandlers() {
    if (modalClose) {
        modalClose.addEventListener('click', hideSuccessModal);
    }
    
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                hideSuccessModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && successModal && !successModal.classList.contains('hidden')) {
            hideSuccessModal();
        }
    });
}

function showSuccessModal() {
    if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideSuccessModal() {
    if (successModal) {
        successModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Scroll Animations with Intersection Observer
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .fade-in-up');
    
    if (!animatedElements.length) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
}

// Parallax Effects for Floating Shapes
function initParallaxEffects() {
    const shapes = document.querySelectorAll('.shape');
    
    if (!shapes.length) return;
    
    window.addEventListener('scroll', debounce(function() {
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            const yPos = rate * speed;
            shape.style.transform = `translateY(${yPos}px)`;
        });
    }, 10));
}

// Service Card Clicks
function initServiceCardClicks() {
    const serviceLinks = document.querySelectorAll('.service__link');
    
    serviceLinks.forEach(link => {
        if (link.getAttribute('href') === '#contact') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Pre-fill the service field
                const serviceTitle = this.closest('.service__card').querySelector('.service__title').textContent;
                const serviceSelect = document.getElementById('service');
                
                if (serviceSelect) {
                    // Map service titles to select values
                    const serviceMap = {
                        'LinkedIn Profile Revamp': 'linkedin-revamp',
                        'YouTube Growth Accelerator': 'youtube-growth',
                        'Spiritual Energy Coaching': 'spiritual-coaching',
                        'Wellness & Confidence Workshops': 'wellness-workshops'
                    };
                    
                    const value = serviceMap[serviceTitle];
                    if (value) {
                        serviceSelect.value = value;
                    }
                }
                
                // Scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = contactSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
}

// Statistics Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat__number');
    
    if (!statNumbers.length) return;
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const number = text.match(/\d+/);
    
    if (number) {
        const targetValue = parseInt(number[0]);
        const prefix = text.substring(0, text.indexOf(number[0]));
        const suffix = text.substring(text.indexOf(number[0]) + number[0].length);
        
        let currentValue = 0;
        const increment = targetValue / 100;
        const duration = 2000; // 2 seconds
        const stepTime = duration / 100;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            
            element.textContent = prefix + Math.floor(currentValue) + suffix;
        }, stepTime);
    }
}

// Handle image loading errors gracefully
function initImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Create a placeholder div
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: ${this.offsetWidth || 400}px;
                height: ${this.offsetHeight || 400}px;
                background: #4FD1C7;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                border-radius: 50%;
                text-align: center;
                padding: 20px;
            `;
            placeholder.textContent = 'Profile Image';
            
            // Replace image with placeholder
            this.parentNode.replaceChild(placeholder, this);
        });
    });
}

// Video Placeholder Interactions
function initVideoPlaceholders() {
    const videoPlaceholders = document.querySelectorAll('.video__placeholder');
    
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 150);
            
            // You could replace this with actual video loading logic
            console.log('Video clicked:', this.querySelector('p').textContent);
        });
    });
}

// Achievement Card Animations
function initAchievements() {
    const achievements = document.querySelectorAll('.achievement');
    
    if (!achievements.length) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 200); // Stagger animation
            }
        });
    }, observerOptions);
    
    achievements.forEach(achievement => {
        achievement.style.opacity = '0';
        achievement.style.transform = 'translateX(-30px)';
        achievement.style.transition = 'all 0.6s ease';
        observer.observe(achievement);
    });
}

// Enhanced Form Field Interactions
function initEnhancedFormFields() {
    const formInputs = document.querySelectorAll('.form__input');
    
    formInputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value.trim() !== '') {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
        
        // Check if field is pre-filled
        if (input.value.trim() !== '') {
            input.parentElement.classList.add('filled');
        }
    });
}

// Error handling for form validation
function displayFormError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form__general-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: #ffe6e6;
        color: #FF6B6B;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
    `;
    
    const form = document.getElementById('contact-form');
    if (form) {
        const firstChild = form.firstElementChild;
        form.insertBefore(errorDiv, firstChild);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Utility function for smooth scrolling to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize additional features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initVideoPlaceholders();
    initAchievements();
    initEnhancedFormFields();
});

// Handle window resize events
window.addEventListener('resize', debounce(function() {
    // Handle any resize-specific logic here
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
}, 250));

// Handle scroll events with debouncing for performance
const debouncedScrollHandler = debounce(function() {
    // Any additional scroll-based functionality can go here
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// Add CSS for form error states
const style = document.createElement('style');
style.textContent = `
    .form__input.error {
        border-color: #FF6B6B;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
    }
    
    .form__input.error:focus {
        border-color: #FF6B6B;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.3);
    }
    
    .form__group.focused .form__label {
        color: #4FD1C7;
    }
    
    .form__group.filled .form__label {
        font-weight: 600;
    }
    
    .nav__link.active {
        color: #4FD1C7;
    }
    
    .nav__link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);
