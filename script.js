// SerenityAI Website JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initPrototypeCarousel();
    initTestimonialsCarousel();
    initSignupForm();
    initScrollAnimations();
    initSmoothScrolling();
});

// Prototype Preview Carousel
let currentSlide = 0;
const screens = [
    {
        title: "Welcome Screen",
        description: "A warm, calming introduction that sets the tone for your mental wellness journey.",
        features: [
            "Personalized greeting",
            "Quick mood check-in",
            "Daily wellness tips",
            "Progress overview"
        ],
        background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        icon: "fas fa-mobile-alt",
        iconColor: "#1e3a8a"
    },
    {
        title: "Assessment Interface",
        description: "Intuitive questionnaire designed to understand your emotional state with compassion.",
        features: [
            "Progress indicators",
            "Gentle question flow",
            "Skip options available",
            "Real-time feedback"
        ],
        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
        icon: "fas fa-desktop",
        iconColor: "#d97706"
    },
    {
        title: "Healing Dashboard",
        description: "Your personalized wellness hub with recommended therapies and activities.",
        features: [
            "Custom sound frequencies",
            "Light therapy controls",
            "Meditation sessions",
            "Progress tracking"
        ],
        background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
        icon: "fas fa-tablet-alt",
        iconColor: "#7c3aed"
    },
    {
        title: "Chat Interface",
        description: "Secure, anonymous messaging with licensed mental health professionals.",
        features: [
            "End-to-end encryption",
            "Anonymous profiles",
            "24/7 availability",
            "File sharing support"
        ],
        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
        icon: "fas fa-mobile-alt",
        iconColor: "#059669"
    }
];

function initPrototypeCarousel() {
    const mockupScreen = document.getElementById('mockup-screen');
    const screenTitle = document.getElementById('screen-title');
    const screenDescription = document.getElementById('screen-description');
    const screenFeatures = document.getElementById('screen-features');
    const dotsContainer = document.getElementById('dots-container');

    // Create dots
    screens.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    function updateSlide() {
        const screen = screens[currentSlide];
        
        // Update mockup
        mockupScreen.style.background = screen.background;
        mockupScreen.innerHTML = `
            <div class="mockup-icon" style="color: ${screen.iconColor}">
                <i class="${screen.icon}"></i>
            </div>
            <h3 class="mockup-title" style="color: ${screen.iconColor}">${screen.title}</h3>
            <p class="mockup-desc" style="color: ${screen.iconColor}">SerenityAI</p>
        `;

        // Update content
        screenTitle.textContent = screen.title;
        screenDescription.textContent = screen.description;
        screenFeatures.innerHTML = screen.features.map(feature => `<li>${feature}</li>`).join('');

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    window.nextSlide = function() {
        currentSlide = (currentSlide + 1) % screens.length;
        updateSlide();
    };

    window.prevSlide = function() {
        currentSlide = (currentSlide - 1 + screens.length) % screens.length;
        updateSlide();
    };

    window.goToSlide = function(index) {
        currentSlide = index;
        updateSlide();
    };

    // Auto-advance slides every 5 seconds
    setInterval(nextSlide, 5000);
}

// Testimonials Carousel
let currentTestimonial = 0;
const testimonials = [
    {
        text: "SerenityAI has been a game-changer for my mental health. The assessment was so intuitive and the personalized healing sessions have helped me manage my anxiety in ways I never thought possible.",
        author: "Alex M.",
        role: "Beta User",
        rating: 5
    },
    {
        text: "I was skeptical about AI-powered mental health, but the anonymous chat feature with real psychologists made me feel safe and supported. The interface is beautiful and easy to use.",
        author: "Sarah K.",
        role: "Early Adopter",
        rating: 5
    },
    {
        text: "The mood tracking feature has helped me understand my emotional patterns better. The guided meditations are incredibly calming, and I love how everything is personalized to my needs.",
        author: "Michael R.",
        role: "Wellness Enthusiast",
        rating: 5
    },
    {
        text: "As someone who struggles with depression, having 24/7 access to support through SerenityAI has been invaluable. The emergency features give me peace of mind knowing help is always available.",
        author: "Jennifer L.",
        role: "Mental Health Advocate",
        rating: 5
    },
    {
        text: "The sound therapy and light features are amazing! I use them daily for stress relief. The app has become an essential part of my self-care routine.",
        author: "David T.",
        role: "Beta Tester",
        rating: 5
    }
];

function initTestimonialsCarousel() {
    const testimonialText = document.getElementById('testimonial-text');
    const authorName = document.getElementById('author-name');
    const authorRole = document.getElementById('author-role');
    const testimonialDots = document.getElementById('testimonial-dots');

    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToTestimonial(index);
        testimonialDots.appendChild(dot);
    });

    function updateTestimonial() {
        const testimonial = testimonials[currentTestimonial];
        
        testimonialText.textContent = testimonial.text;
        authorName.textContent = testimonial.author;
        authorRole.textContent = testimonial.role;

        // Update dots
        document.querySelectorAll('#testimonial-dots .dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentTestimonial);
        });
    }

    window.nextTestimonial = function() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        updateTestimonial();
    };

    window.prevTestimonial = function() {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        updateTestimonial();
    };

    window.goToTestimonial = function(index) {
        currentTestimonial = index;
        updateTestimonial();
    };

    // Auto-advance testimonials every 6 seconds
    setInterval(nextTestimonial, 6000);
}

// Signup Form
function initSignupForm() {
    const form = document.getElementById('signup-form');
    const successMessage = document.getElementById('success-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!email) return;

        // Show loading state
        submitBtn.innerHTML = 'Signing Up...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Show success message
            successMessage.style.display = 'flex';
            form.reset();
            
            // Reset button
            submitBtn.innerHTML = 'Get Early Access <i class="fas fa-arrow-right"></i>';
            submitBtn.disabled = false;

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements that should animate
    const animatedElements = document.querySelectorAll('.fade-in-on-scroll, .scale-in-on-scroll, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation to elements as they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const loadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply initial styles and observe elements
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .step-card, .phase-card, .team-card, .benefit-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        loadObserver.observe(el);
    });
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Global function for mobile menu
window.toggleMobileMenu = toggleMobileMenu;

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add form validation to signup form
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.querySelector('input[type="email"]');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value;
            if (email && !validateEmail(email)) {
                this.style.borderColor = '#ef4444';
                this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                this.style.boxShadow = 'none';
            }
        });
    }
});

// Keyboard Navigation for Carousels
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        if (document.querySelector('.prototype-preview').matches(':hover')) {
            prevSlide();
        } else if (document.querySelector('.testimonials').matches(':hover')) {
            prevTestimonial();
        }
    } else if (e.key === 'ArrowRight') {
        if (document.querySelector('.prototype-preview').matches(':hover')) {
            nextSlide();
        } else if (document.querySelector('.testimonials').matches(':hover')) {
            nextTestimonial();
        }
    }
});

// Accessibility: Focus management
document.addEventListener('DOMContentLoaded', function() {
    // Add skip link for accessibility
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #f59e0b;
        color: #0f172a;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
    `;
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('.hero');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
});

// Performance: Lazy loading for images (if any are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Mouse tracking effects
function initMouseTracking() {
    const hero = document.querySelector('.hero');
    const particles = document.querySelectorAll('.particle');
    
    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const x = (clientX / innerWidth - 0.5) * 20;
        const y = (clientY / innerHeight - 0.5) * 20;
        
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 0.5;
            particle.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

// Initialize mouse tracking
document.addEventListener('DOMContentLoaded', () => {
    initMouseTracking();
});

// Console welcome message
console.log(`
🌟 Welcome to SerenityAI! 🌟

Your AI companion for mental wellness is ready to help you on your journey to better mental health.

Features:
- Emotional State Assessment
- Personalized Healing
- Anonymous Chat with Psychologists
- Mood Tracking & Analytics
- AI-Powered Self-Care Tips

Built with ❤️ for mental wellness
`); 