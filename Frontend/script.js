// SerenityAI Website JavaScript - Refactored & Enhanced
import { 
    registerUser, 
    loginUser, 
    getProfile, 
    saveToken, 
    clearToken, 
    isLoggedIn,
    submitAssessment,
    getAssessmentQuestions,
    getAssessmentResults
} from './api.js';

// Global state management
const AppState = {
    currentUser: null,
    isAuthenticated: false,
    currentSlide: 0,
    currentTestimonial: 0,
    autoAdvanceInterval: null
};

// DOM Content Loaded - Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 SerenityAI - Initializing...');
    
    // Initialize all components
    initAuthentication();
    initPrototypeCarousel();
    initTestimonialsCarousel();
    initSignupForm();
    initScrollAnimations();
    initSmoothScrolling();
    initThemeToggle();
    initFeatureModals();
    initMobileMenu();
    initAccessibility();
    
    console.log('✅ SerenityAI - Initialization complete!');
});

// ===== AUTHENTICATION SYSTEM =====
function initAuthentication() {
    // Check if user is already logged in
    if (isLoggedIn()) {
        loadUserProfile();
    }
    
    // Add login/register forms if they exist
    setupAuthForms();
    updateAuthUI();
}

async function loadUserProfile() {
    try {
        const profile = await getProfile();
        if (profile.success) {
            AppState.currentUser = profile.user;
            AppState.isAuthenticated = true;
            updateAuthUI();
        } else {
            // Token is invalid, clear it
            clearToken();
            AppState.isAuthenticated = false;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        clearToken();
        AppState.isAuthenticated = false;
    }
}

function setupAuthForms() {
    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const name = form.querySelector('input[name="name"]')?.value || '';
    
    try {
        const result = await registerUser(email, password, name);
        if (result.success) {
            saveToken(result.token);
            AppState.currentUser = result.user;
            AppState.isAuthenticated = true;
            updateAuthUI();
            showMessage('Registration successful! Welcome to SerenityAI.', 'success');
        } else {
            showMessage(result.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    
    try {
        const result = await loginUser(email, password);
        if (result.success) {
            saveToken(result.token);
            AppState.currentUser = result.user;
            AppState.isAuthenticated = true;
            updateAuthUI();
            showMessage('Login successful! Welcome back.', 'success');
        } else {
            showMessage(result.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    }
}

function handleLogout() {
    clearToken();
    AppState.currentUser = null;
    AppState.isAuthenticated = false;
    updateAuthUI();
    showMessage('You have been logged out successfully.', 'info');
}

function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const profileSection = document.getElementById('profile-section');
    
    if (AppState.isAuthenticated && AppState.currentUser) {
        // Show profile section
        if (profileSection) {
            profileSection.style.display = 'block';
            const nameSpan = profileSection.querySelector('#profile-name');
            const emailSpan = profileSection.querySelector('#profile-email');
            if (nameSpan) nameSpan.textContent = AppState.currentUser.name || 'User';
            if (emailSpan) emailSpan.textContent = AppState.currentUser.email;
        }
        
        // Hide auth section
        if (authSection) {
            authSection.style.display = 'none';
        }
        
        // Update navigation
        updateNavigationForAuth();
    } else {
        // Show auth section
        if (authSection) {
            authSection.style.display = 'block';
        }
        
        // Hide profile section
        if (profileSection) {
            profileSection.style.display = 'none';
        }
        
        // Update navigation
        updateNavigationForGuest();
    }
}

function updateNavigationForAuth() {
    // Enable protected features
    const protectedLinks = document.querySelectorAll('[data-requires-auth]');
    protectedLinks.forEach(link => {
        link.style.display = 'inline-block';
        link.removeAttribute('disabled');
    });
}

function updateNavigationForGuest() {
    // Disable protected features
    const protectedLinks = document.querySelectorAll('[data-requires-auth]');
    protectedLinks.forEach(link => {
        link.style.display = 'none';
        link.setAttribute('disabled', 'true');
    });
}

// ===== PROTOTYPE CAROUSEL =====
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
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    if (!mockupScreen || !screenTitle || !screenDescription || !screenFeatures) {
        console.warn('Prototype carousel elements not found');
        return;
    }

    // Create dots
    screens.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // Add event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => prevSlide());
        prevBtn.setAttribute('aria-label', 'Previous slide');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => nextSlide());
        nextBtn.setAttribute('aria-label', 'Next slide');
    }

    // Initialize first slide
    updateSlide();
}

function updateSlide() {
    const mockupScreen = document.getElementById('mockup-screen');
    const screenTitle = document.getElementById('screen-title');
    const screenDescription = document.getElementById('screen-description');
    const screenFeatures = document.getElementById('screen-features');
    const dots = document.querySelectorAll('.prototype-preview .dot');
    
    const screen = screens[AppState.currentSlide];
    
    // Update mockup
    mockupScreen.style.background = screen.background;
    mockupScreen.innerHTML = `
        <div class="mockup-icon" style="color: ${screen.iconColor}">
            <i class="${screen.icon}" aria-hidden="true"></i>
        </div>
        <h3 class="mockup-title" style="color: ${screen.iconColor}">${screen.title}</h3>
        <p class="mockup-desc" style="color: ${screen.iconColor}">SerenityAI</p>
    `;

    // Update content
    screenTitle.textContent = screen.title;
    screenDescription.textContent = screen.description;
    
    // Update features list
    screenFeatures.innerHTML = screen.features.map(feature => 
        `<li>${feature}</li>`
    ).join('');

    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === AppState.currentSlide);
    });
}

function nextSlide() {
    AppState.currentSlide = (AppState.currentSlide + 1) % screens.length;
    updateSlide();
}

function prevSlide() {
    AppState.currentSlide = AppState.currentSlide === 0 ? screens.length - 1 : AppState.currentSlide - 1;
    updateSlide();
}

function goToSlide(index) {
    if (index >= 0 && index < screens.length) {
        AppState.currentSlide = index;
        updateSlide();
    }
}

// ===== TESTIMONIALS CAROUSEL =====
const testimonials = [
    {
        text: "SerenityAI provided me with the support I needed during a difficult period. The assessment was insightful, and the healing tools helped me manage stress more effectively.",
        author: "Priya S.",
        role: "Healthcare Professional",
        rating: 5,
        verified: true,
        avatar: "👩‍⚕️"
    },
    {
        text: "The anonymous chat feature gave me the courage to seek help when I needed it most. The psychologists are incredibly supportive and professional.",
        author: "Michael R.",
        role: "Software Engineer",
        rating: 5,
        verified: true,
        avatar: "👨‍💻"
    },
    {
        text: "I love how personalized the experience is. The app really understands my needs and provides relevant recommendations that actually work.",
        author: "Sarah L.",
        role: "Student",
        rating: 5,
        verified: false,
        avatar: "👩‍🎓"
    },
    {
        text: "The sound therapy sessions are amazing. I use them daily to help me relax and focus. This app has become an essential part of my wellness routine.",
        author: "David K.",
        role: "Teacher",
        rating: 5,
        verified: true,
        avatar: "👨‍🏫"
    }
];

function initTestimonialsCarousel() {
    const testimonialCard = document.getElementById('testimonial-card');
    const testimonialText = document.getElementById('testimonial-text');
    const authorName = document.getElementById('author-name');
    const authorRole = document.getElementById('author-role');
    const testimonialRating = document.getElementById('testimonial-rating');
    const testimonialAvatar = document.getElementById('testimonial-avatar');
    const verifiedBadge = document.getElementById('verified-badge');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('prev-testimonial-btn');
    const nextBtn = document.getElementById('next-testimonial-btn');

    if (!testimonialCard || !testimonialText || !authorName || !authorRole) {
        console.warn('Testimonials carousel elements not found');
        return;
    }

    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dot.addEventListener('click', () => goToTestimonial(index));
        dotsContainer.appendChild(dot);
    });

    // Add event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => prevTestimonial());
        prevBtn.setAttribute('aria-label', 'Previous testimonial');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => nextTestimonial());
        nextBtn.setAttribute('aria-label', 'Next testimonial');
    }

    // Initialize first testimonial
    updateTestimonial();
    
    // Start auto-advance
    startTestimonialAutoAdvance();
}

function updateTestimonial() {
    const testimonial = testimonials[AppState.currentTestimonial];
    const testimonialText = document.getElementById('testimonial-text');
    const authorName = document.getElementById('author-name');
    const authorRole = document.getElementById('author-role');
    const testimonialRating = document.getElementById('testimonial-rating');
    const testimonialAvatar = document.getElementById('testimonial-avatar');
    const verifiedBadge = document.getElementById('verified-badge');
    const dots = document.querySelectorAll('.testimonials .dot');

    if (testimonialText) testimonialText.textContent = testimonial.text;
    if (authorName) authorName.textContent = testimonial.author;
    if (authorRole) authorRole.textContent = testimonial.role;
    
    // Update rating
    if (testimonialRating) {
        testimonialRating.innerHTML = Array(testimonial.rating)
            .fill('<i class="fas fa-star"></i>')
            .join('');
    }
    
    // Update avatar
    if (testimonialAvatar) {
        testimonialAvatar.textContent = testimonial.avatar;
    }
    
    // Update verified badge
    if (verifiedBadge) {
        verifiedBadge.style.display = testimonial.verified ? 'inline' : 'none';
    }

    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === AppState.currentTestimonial);
    });

    // Announce change for screen readers
    const testimonialCard = document.getElementById('testimonial-card');
    if (testimonialCard) {
        testimonialCard.setAttribute('aria-label', `Testimonial from ${testimonial.author}: ${testimonial.text}`);
    }
}

function nextTestimonial() {
    AppState.currentTestimonial = (AppState.currentTestimonial + 1) % testimonials.length;
    updateTestimonial();
}

function prevTestimonial() {
    AppState.currentTestimonial = AppState.currentTestimonial === 0 ? testimonials.length - 1 : AppState.currentTestimonial - 1;
    updateTestimonial();
}

function goToTestimonial(index) {
    if (index >= 0 && index < testimonials.length) {
        AppState.currentTestimonial = index;
        updateTestimonial();
    }
}

function startTestimonialAutoAdvance() {
    if (AppState.autoAdvanceInterval) {
        clearInterval(AppState.autoAdvanceInterval);
    }
    
    AppState.autoAdvanceInterval = setInterval(() => {
        nextTestimonial();
    }, 5000);
}

function pauseTestimonialAutoAdvance() {
    if (AppState.autoAdvanceInterval) {
        clearInterval(AppState.autoAdvanceInterval);
        AppState.autoAdvanceInterval = null;
    }
}

function resumeTestimonialAutoAdvance() {
    if (!AppState.autoAdvanceInterval) {
        startTestimonialAutoAdvance();
    }
}

// ===== SIGNUP FORM =====
function initSignupForm() {
    const form = document.getElementById('signup-form');
    const successMessage = document.getElementById('success-message');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();
        
        if (!email || !validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            emailInput.focus();
            return;
        }

        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing Up...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:5000/api/waitlist/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Show success message
                if (successMessage) {
                    successMessage.style.display = 'flex';
                }
                form.reset();
                showMessage('Successfully added to waitlist! We\'ll keep you updated.', 'success');
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    if (successMessage) {
                        successMessage.style.display = 'none';
                    }
                }, 5000);
            } else {
                showMessage(data.message || 'Signup failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Signup error:', err);
            showMessage('Network error. Please check your connection and try again.', 'error');
        }
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== SCROLL ANIMATIONS =====
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

// ===== SMOOTH SCROLLING =====
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
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            
            // Update ARIA attributes
            navToggle.setAttribute('aria-expanded', isActive);
            navMenu.setAttribute('aria-hidden', !isActive);
            
            // Update icon
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.click();
            }
        });
    }
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
        
        // Load theme from localStorage or system preference
        let theme = localStorage.getItem('theme');
        if (!theme) {
            theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        setTheme(theme);
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Announce theme change for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-label', `Theme changed to ${theme} mode`);
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ===== FEATURE MODALS =====
const featureDetails = {
    assessment: {
        title: 'Emotional State Assessment',
        body: `<p><strong>Comprehensive Questionnaire:</strong> Our assessment uses advanced psychological models to evaluate your emotional well-being across multiple dimensions. Each question is designed to be empathetic and non-intrusive, ensuring a comfortable experience.</p>
        <ul>
            <li>Personalized, adaptive questions based on your responses</li>
            <li>Instant feedback and progress tracking</li>
            <li>Confidential, secure, and never shared</li>
            <li>Visual analytics to help you understand your emotional trends</li>
        </ul>
        <p><strong>Why it matters:</strong> Early self-awareness is the first step to better mental health. Our tool empowers you to take control of your journey.</p>`
    },
    healing: {
        title: 'Personalized Healing',
        body: `<p><strong>Sound & Light Therapy:</strong> Experience healing sessions tailored to your emotional needs. Our algorithms recommend specific sound frequencies and light patterns proven to reduce stress and anxiety.</p>
        <ul>
            <li>Scientifically-backed sound frequencies for relaxation</li>
            <li>Adaptive light therapy for mood enhancement</li>
            <li>Guided meditations and breathing exercises</li>
            <li>Personalized recommendations based on your assessment</li>
        </ul>
        <p><strong>Why it matters:</strong> Personalized healing maximizes effectiveness and helps you build healthy habits for long-term wellness.</p>`
    },
    chat: {
        title: 'Anonymous Chat with Psychologist',
        body: `<p><strong>Professional Guidance, 100% Anonymous:</strong> Connect with licensed psychologists in a secure, private environment. No account or personal details required.</p>
        <ul>
            <li>End-to-end encrypted conversations</li>
            <li>24/7 access to mental health professionals</li>
            <li>Share files, voice notes, and more</li>
            <li>Get actionable advice and emotional support</li>
        </ul>
        <p><strong>Why it matters:</strong> Sometimes, you just need someone to listen. Our chat feature ensures you're never alone on your journey.</p>`
    }
};

function initFeatureModals() {
    // Add event listeners to learn more buttons
    document.querySelectorAll('.learn-more-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const feature = e.currentTarget.getAttribute('data-feature');
            openFeatureModal(feature);
        });
    });
    
    // Modal close functionality
    const modalClose = document.getElementById('modal-close');
    const modal = document.getElementById('feature-modal');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeFeatureModal);
    }
    
    if (modal) {
        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeFeatureModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeFeatureModal();
            }
        });
    }
}

function openFeatureModal(featureKey) {
    const modal = document.getElementById('feature-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const details = featureDetails[featureKey];
    
    console.log('Learn More clicked:', featureKey, details, modal, modalTitle, modalBody);
    if (details && modal && modalTitle && modalBody) {
        modalTitle.textContent = details.title;
        modalBody.innerHTML = details.body;
        modal.style.display = 'block';
        modal.style.visibility = 'visible'; // Defensive: force visible
        modal.style.opacity = '1'; // Defensive: force visible
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (firstElement) firstElement.focus();
        
        // Handle tab key for focus trap
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    } else {
        console.error('Modal open failed:', {featureKey, details, modal, modalTitle, modalBody});
    }
}

function closeFeatureModal() {
    const modal = document.getElementById('feature-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Return focus to the element that opened the modal
        const lastActiveElement = document.querySelector('.learn-more-btn:focus');
        if (lastActiveElement) {
            lastActiveElement.focus();
        }
    }
}

// ===== ACCESSIBILITY =====
function initAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-bright);
        color: var(--text-primary);
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('.hero') || document.querySelector('main');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
    
    // Add ARIA labels to icons
    document.querySelectorAll('i[class*="fas"], i[class*="fab"]').forEach(icon => {
        if (!icon.getAttribute('aria-label') && !icon.getAttribute('aria-hidden')) {
            icon.setAttribute('aria-hidden', 'true');
        }
    });
    
    // Add keyboard navigation for carousels
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
}

// ===== UTILITY FUNCTIONS =====
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 5000);
}

// ===== PERFORMANCE OPTIMIZATIONS =====
// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
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

// Parallax effect for hero section
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }
}

// Mouse tracking effects
function initMouseTracking() {
    const hero = document.querySelector('.hero');
    const particles = document.querySelectorAll('.particle');
    
    if (hero && particles.length > 0) {
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
}

// Initialize performance features
document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();
    initParallax();
    initMouseTracking();
});

// ===== GLOBAL FUNCTIONS (for backward compatibility) =====
// These are kept for any existing inline onclick handlers
window.toggleMobileMenu = function() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    if (navMenu && navToggle) {
        navToggle.click();
    }
};

window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.prevTestimonial = prevTestimonial;
window.nextTestimonial = nextTestimonial;
window.openFeatureModal = openFeatureModal;
window.closeFeatureModal = closeFeatureModal;

// ===== CONSOLE WELCOME =====
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