/**
 * Scroll Manager Module
 * Handles scroll-to-top button and header scroll effects
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const ScrollManager = {
    /**
     * Configuration
     */
    config: {
        scrollThreshold: 300, // px to scroll before showing button
    },
    
    /**
     * DOM Elements
     */
    elements: {
        scrollToTopBtn: null,
        mainElement: null,
        header: null,
        heroSection: null,
        footer: null
    },
    
    /**
     * Initialize scroll functionality
     */
    init: function() {
        this.cacheElements();
        this.bindEvents();
        this.initHeaderEffect();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        this.elements.scrollToTopBtn = document.getElementById('scrollToTop');
        this.elements.mainElement = document.querySelector('main');
        this.elements.header = document.getElementById('site-header');
        this.elements.heroSection = document.getElementById('hero-section');
        this.elements.footer = document.getElementById('site-footer');
    },
    
    /**
     * Bind scroll events
     */
    bindEvents: function() {
        const self = this;
        
        // Track window scroll (for regular pages)
        window.addEventListener('scroll', function() {
            self.toggleScrollButton(window.pageYOffset);
            self.adjustButtonPosition();
        });
        
        // Track main element scroll (for homepage with snap-scroll)
        if (this.elements.mainElement) {
            this.elements.mainElement.addEventListener('scroll', function() {
                self.toggleScrollButton(this.scrollTop);
                self.adjustButtonPosition();
            });
        }
        
        // Handle scroll-to-top button click
        if (this.elements.scrollToTopBtn) {
            this.elements.scrollToTopBtn.addEventListener('click', function() {
                self.scrollToTop();
            });
        }
        
        // Adjust on resize
        window.addEventListener('resize', function() {
            self.adjustButtonPosition();
        });
        
        // Initial position check
        this.adjustButtonPosition();
    },
    
    /**
     * Show/hide scroll-to-top button based on scroll position
     * @param {number} scrollTop - Current scroll position
     */
    toggleScrollButton: function(scrollTop) {
        if (!this.elements.scrollToTopBtn) return;
        
        if (scrollTop > this.config.scrollThreshold) {
            this.elements.scrollToTopBtn.classList.remove('opacity-0', 'invisible');
            this.elements.scrollToTopBtn.classList.add('opacity-100', 'visible');
        } else {
            this.elements.scrollToTopBtn.classList.remove('opacity-100', 'visible');
            this.elements.scrollToTopBtn.classList.add('opacity-0', 'invisible');
        }
    },
    
    /**
     * Scroll to top of page
     */
    scrollToTop: function() {
        // Scroll main element if it exists (homepage)
        if (this.elements.mainElement) {
            this.elements.mainElement.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Also scroll window (for other pages)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Remove hash from URL if present
        if (window.location.hash) {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        }
    },
    
    /**
     * Adjust button position to avoid overlapping with footer
     */
    adjustButtonPosition: function() {
        if (!this.elements.scrollToTopBtn || !this.elements.footer) return;
        
        const button = this.elements.scrollToTopBtn;
        const footer = this.elements.footer;
        const buttonRect = button.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Get current bottom offset from button classes
        const computedStyle = window.getComputedStyle(button);
        const currentBottom = parseInt(computedStyle.bottom) || 32; // default 32px (8 * 4 for bottom-8)
        
        // Check if footer is visible and overlapping with button zone
        if (footerRect.top < windowHeight) {
            // Calculate how much we need to push the button up
            const overlap = windowHeight - footerRect.top;
            const newBottom = overlap + 16; // 16px gap from footer
            button.style.bottom = newBottom + 'px';
        } else {
            // Reset to default position
            button.style.bottom = '';
        }
    },
    
    /**
     * Initialize header scroll effect (only on homepage)
     */
    initHeaderEffect: function() {
        if (!this.elements.heroSection || !this.elements.header) return;
        
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    const header = document.getElementById('site-header');
                    if (!header) return;
                    
                    if (!entry.isIntersecting) {
                        header.classList.add('bg-black/80', 'backdrop-blur-sm');
                        header.classList.remove('bg-transparent');
                    } else {
                        header.classList.remove('bg-black/80', 'backdrop-blur-sm');
                        header.classList.add('bg-transparent');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        observer.observe(this.elements.heroSection);
    }
};
