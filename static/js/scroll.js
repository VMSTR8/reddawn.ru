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
     * Cached measurements (to prevent forced reflow)
     */
    cache: {
        windowHeight: 0,
        footerTop: 0,
        buttonBottom: 32,
        needsUpdate: true
    },
    
    /**
     * Animation frame ID
     */
    rafId: null,
    
    /**
     * Initialize scroll functionality
     */
    init: function() {
        const self = this;
        
        // Batch all DOM queries in one go to prevent multiple reflows
        requestAnimationFrame(function() {
            self.cacheElements();
            self.bindEvents();
            self.initHeaderEffect();
        });
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        // Batch all DOM queries together
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
            self.invalidateCache();
            self.adjustButtonPosition();
        }, { passive: true });
        
        // Track main element scroll (for homepage with snap-scroll)
        if (this.elements.mainElement) {
            this.elements.mainElement.addEventListener('scroll', function() {
                self.toggleScrollButton(this.scrollTop);
                self.invalidateCache();
                self.adjustButtonPosition();
            }, { passive: true });
        }
        
        // Handle scroll-to-top button click
        if (this.elements.scrollToTopBtn) {
            this.elements.scrollToTopBtn.addEventListener('click', function() {
                self.scrollToTop();
            });
        }
        
        // Adjust on resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                self.invalidateCache();
                self.adjustButtonPosition();
            }, 150);
        }, { passive: true });
        
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
     * Update cached measurements (called on scroll/resize)
     */
    updateCache: function() {
        if (!this.cache.needsUpdate) return;
        
        // Batch all reads together (prevents forced reflow)
        // Use global viewport cache if available
        this.cache.windowHeight = window.RedDawnViewport ? 
            window.RedDawnViewport.height : window.innerHeight;
        
        if (this.elements.footer) {
            this.cache.footerTop = this.elements.footer.getBoundingClientRect().top;
        }
        
        this.cache.needsUpdate = false;
    },
    
    /**
     * Adjust button position to avoid overlapping with footer
     * Optimized version that batches DOM reads/writes
     */
    adjustButtonPosition: function() {
        if (!this.elements.scrollToTopBtn || !this.elements.footer) return;
        
        const self = this;
        
        // Cancel previous animation frame
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Schedule update in next animation frame
        this.rafId = requestAnimationFrame(function() {
            // Read phase (batch all measurements)
            self.updateCache();
            
            const footerTop = self.cache.footerTop;
            const windowHeight = self.cache.windowHeight;
            
            // Write phase (apply changes)
            if (footerTop < windowHeight) {
                const overlap = windowHeight - footerTop;
                const newBottom = overlap + 16; // 16px gap from footer
                self.elements.scrollToTopBtn.style.bottom = newBottom + 'px';
            } else {
                self.elements.scrollToTopBtn.style.bottom = '';
            }
            
            self.rafId = null;
        });
    },
    
    /**
     * Mark cache as needing update
     */
    invalidateCache: function() {
        this.cache.needsUpdate = true;
    },
    
    /**
     * Initialize header scroll effect (only on homepage)
     */
    initHeaderEffect: function() {
        if (!this.elements.heroSection || !this.elements.header) return;
        
        const self = this;
        const header = this.elements.header;
        
        // Use IntersectionObserver for desktop (with snap-scroll)
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
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
        
        // Add scroll listener for mobile (where snap-scroll is disabled)
        // This ensures header gets dark background on any scroll down
        let ticking = false;
        
        const updateHeaderOnScroll = function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // On mobile (< 1024px) activate dark header on minimal scroll
            if (window.innerWidth < 1024) {
                if (scrollTop > 50) {
                    header.classList.add('bg-black/80', 'backdrop-blur-sm');
                    header.classList.remove('bg-transparent');
                } else {
                    header.classList.remove('bg-black/80', 'backdrop-blur-sm');
                    header.classList.add('bg-transparent');
                }
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateHeaderOnScroll);
                ticking = true;
            }
        }, { passive: true });
        
        // Also check on main element scroll (for homepage)
        if (this.elements.mainElement) {
            let mainTicking = false;
            
            this.elements.mainElement.addEventListener('scroll', function() {
                if (!mainTicking && window.innerWidth < 1024) {
                    requestAnimationFrame(function() {
                        const scrollTop = self.elements.mainElement.scrollTop;
                        if (scrollTop > 50) {
                            header.classList.add('bg-black/80', 'backdrop-blur-sm');
                            header.classList.remove('bg-transparent');
                        } else {
                            header.classList.remove('bg-black/80', 'backdrop-blur-sm');
                            header.classList.add('bg-transparent');
                        }
                        mainTicking = false;
                    });
                    mainTicking = true;
                }
            }, { passive: true });
        }
    }
};
