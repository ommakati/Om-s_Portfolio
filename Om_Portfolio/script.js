// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// State management
const state = {
    isLoading: true,
    activeSection: 'home',
    animatedElements: new Set(),
    particles: []
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    createParticles();
    initializeNavigation();
    initializeAnimations();
    initializeTypewriter();
    initializeCounters();
    initializeForms();
    initializeInteractions();
    hideLoader();
}

// Particle system
function createParticles() {
    const container = $('#particles-container');
    if (!container) return;
    
    const particleCount = window.innerWidth > 768 ? 50 : 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        container.appendChild(particle);
        state.particles.push(particle);
    }
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = $('#hamburger');
    const navMenu = $('#nav-menu');
    const navbar = $('#navbar');
    const navLinks = $$('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
            
            const targetId = link.getAttribute('href');
            const target = $(targetId);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (navbar) {
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        updateActiveNavLink();
        handleBackToTopButton();
        
        lastScrollY = currentScrollY;
    });
}

// Update active navigation link
function updateActiveNavLink() {
    const sections = $$('section');
    const navLinks = $$('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
            state.activeSection = current;
        }
    });
}

// Animation on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !state.animatedElements.has(entry.target)) {
                entry.target.classList.add('animated');
                state.animatedElements.add(entry.target);
                
                // Trigger counter animation if it's a stat item
                if (entry.target.classList.contains('stat-item')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    $$('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Typewriter effect
function initializeTypewriter() {
    const typingElement = $('#typing-text');
    if (!typingElement) return;
    
    const text = typingElement.textContent;
    typingElement.textContent = '';
    
    let i = 0;
    const typeSpeed = 80;
    
    function typeWriter() {
        if (i < text.length) {
            typingElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, typeSpeed);
        }
    }
    
    setTimeout(typeWriter, 1000);
}

// Counter animation
function initializeCounters() {
    $$('.stat-number').forEach(counter => {
        counter.textContent = '0';
    });
}

function animateCounter(statItem) {
    const counter = statItem.querySelector('.stat-number');
    if (!counter) return;
    
    const target = parseInt(counter.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            counter.textContent = target + (target === 100 ? '%' : '+');
            clearInterval(timer);
        } else {
            counter.textContent = Math.floor(current) + (target === 100 ? '%' : '+');
        }
    }, 16);
}

// Form handling
function initializeForms() {
    const contactForm = $('#contact-form');
    if (!contactForm) return;

    // Form input enhancements
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Handle floating labels
        input.addEventListener('input', handleInputChange);
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
        
        // Initialize state
        if (input.value.trim() !== '') {
            input.classList.add('has-value');
        }
    });

    // Form submission
    contactForm.addEventListener('submit', handleFormSubmission);
}

function handleInputChange(e) {
    const input = e.target;
    if (input.value.trim() !== '') {
        input.classList.add('has-value');
    } else {
        input.classList.remove('has-value');
    }
}

function handleInputFocus(e) {
    e.target.classList.add('focused');
}

function handleInputBlur(e) {
    const input = e.target;
    input.classList.remove('focused');
    
    if (input.value.trim() !== '') {
        input.classList.add('has-value');
    } else {
        input.classList.remove('has-value');
    }
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validation
    const errors = validateForm(data);
    if (errors.length > 0) {
        showNotification('Please fix the following errors:\n' + errors.join('\n'), 'error');
        return;
    }
    
    // Show loading state
    form.classList.add('loading');
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
        form.reset();
        
        // Reset form state
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.classList.remove('has-value', 'focused');
        });
        
    } catch (error) {
        showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        form.classList.remove('loading');
    }
}

function validateForm(data) {
    const errors = [];
    
    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.subject?.trim()) errors.push('Subject is required');
    if (!data['project-type']) errors.push('Project type is required');
    if (!data.message?.trim()) errors.push('Message is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    return errors;
}

// Interactive elements
function initializeInteractions() {
    // Hero buttons
    const viewWorkBtn = $('#view-work-btn');
    const contactBtn = $('#contact-btn');
    const downloadCVBtn = $('#download-cv-btn');
    
    if (viewWorkBtn) {
        viewWorkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection('projects');
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection('contact');
        });
    }
    
    // if (downloadCVBtn) {
    //     downloadCVBtn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         handleCVDownload();
    //     });
    //}
    
    // Social links
    // $$('.social-icon, .social-link').forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         handleSocialClick(link);
    //     });
    // });
    
    // Project links
    // $$('.project-link').forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         handleProjectClick(link);
    //     });
    // });
    
    // Certificate verification
    // $$('.certificate-verify').forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         handleCertificateVerification(link);
    //     });
    // });
    
    // Back to top button
    initializeBackToTop();
}

function scrollToSection(sectionId) {
    const section = $(`#${sectionId}`);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function handleCVDownload() {
    // In a real application, this would download the actual CV
    showNotification('CV download would start here. Please add your CV file.', 'info');
    // window.open('path/to/your/cv.pdf', '_blank');
}

function handleSocialClick(link) {
    const platform = link.getAttribute('data-platform');
    const urls = {
        github: 'https://github.com/ommakati',
        linkedin: 'https://linkedin.com/in/yourprofile',
        instagram: 'https://instagram.com/yourusername'
    };
    
    if (urls[platform]) {
        // window.open(urls[platform], '_blank');
        showNotification(`${platform.charAt(0).toUpperCase() + platform.slice(1)} profile would open here.`, 'info');
    }
}

function handleProjectClick(link) {
    const type = link.getAttribute('data-type');
    
    if (type === 'demo') {
        showNotification('Live demo would open here. Add your project URL.', 'info');
        // window.open('your-project-demo-url', '_blank');
    } else if (type === 'github') {
        showNotification('GitHub repository would open here. Add your repo URL.', 'info');
        // window.open('your-github-repo-url', '_blank');
    }
}

function handleCertificateVerification(link) {
    showNotification('Certificate verification would open here.', 'info');
    // window.open('certificate-verification-url', '_blank');
}

// Back to top functionality
function initializeBackToTop() {
    const backToTopBtn = $('#back-to-top');
    if (!backToTopBtn) {
        createBackToTopButton();
    }
    
    const btn = $('#back-to-top');
    if (btn) {
        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function createBackToTopButton() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(button);
}

function handleBackToTopButton() {
    const backToTopBtn = $('#back-to-top');
    if (!backToTopBtn) return;
    
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    $$('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        max-width: 400px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: var(--shadow-large);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    return colors[type] || '#3b82f6';
}

// Loader management
function hideLoader() {
    const loader = $('#loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
                state.isLoading = false;
            }, 500);
        }, 1500);
    }
}

// Utility functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
    }
`;

document.head.appendChild(style);

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recreate particles for new screen size
    state.particles.forEach(particle => particle.remove());
    state.particles = [];
    createParticles();
}, 250));

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        state.particles.forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations when page becomes visible
        state.particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }
});

// Performance optimization
const observeOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

// Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
}, observeOptions);

// Observe images for lazy loading
$$('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

console.log('🚀 Portfolio website loaded successfully! All features are active.');
