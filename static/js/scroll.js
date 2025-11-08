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
        footer: null,
        joinSection: null
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
            
            // Check position after a short delay to ensure page has fully loaded
            // This handles cases where page loads with a hash (e.g., /#join)
            setTimeout(function() {
                self.checkScrollPosition();
            }, 500);
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
        this.elements.joinSection = document.getElementById('join');
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
        
        // Check scroll position after page fully loads
        window.addEventListener('load', function() {
            setTimeout(function() {
                self.checkScrollPosition();
            }, 200);
        }, { passive: true });
        
        // Mobile fix: track when join section gets focus/scrolled into view
        if (this.elements.joinSection) {
            // Use IntersectionObserver to detect when join section is visible
            const joinObserver = new IntersectionObserver(
                function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            // Join section is visible, ensure button shows
                            setTimeout(function() {
                                self.checkScrollPosition();
                            }, 100);
                        }
                    });
                },
                { threshold: 0.1 }
            );
            joinObserver.observe(this.elements.joinSection);
        }
        
        // Handle hash navigation (for anchor links like #join)
        window.addEventListener('hashchange', function() {
            // Delay to ensure scroll has completed
            setTimeout(function() {
                self.checkScrollPosition();
            }, 200);
            // Additional check after longer delay for slower browsers
            setTimeout(function() {
                self.checkScrollPosition();
            }, 500);
        }, { passive: true });
        
        // Check initial hash on page load
        if (window.location.hash) {
            setTimeout(function() {
                self.checkScrollPosition();
            }, 400);
        }
        
        // Handle clicks on anchor links to immediately check position
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a[href*="#"]');
            if (target && target.hash) {
                // Check if clicking on same hash that's already active
                const isSameHash = window.location.hash === target.hash;
                
                // If clicking on #join specifically, force button to show
                if (target.hash === '#join') {
                    // Immediately show button since we know we'll be at bottom
                    if (self.elements.scrollToTopBtn) {
                        self.elements.scrollToTopBtn.classList.remove('opacity-0', 'invisible');
                        self.elements.scrollToTopBtn.classList.add('opacity-100', 'visible');
                    }
                }
                
                // Multiple checks to catch the scroll position
                setTimeout(function() {
                    self.checkScrollPosition();
                }, 150);
                setTimeout(function() {
                    self.checkScrollPosition();
                }, 400);
                setTimeout(function() {
                    self.checkScrollPosition();
                }, 700);
                
                // For same hash clicks, add immediate check too (mobile fix)
                if (isSameHash) {
                    setTimeout(function() {
                        self.checkScrollPosition();
                    }, 50);
                    setTimeout(function() {
                        self.checkScrollPosition();
                    }, 100);
                }
            }
        }, { passive: true });
        
        // Initial position check
        this.adjustButtonPosition();
    },
    
    /**
     * Check current scroll position and update button visibility
     */
    checkScrollPosition: function() {
        // Try to get scroll position from multiple sources
        let scrollTop = 0;
        
        // Check main element scroll (for homepage with snap-scroll on desktop)
        if (this.elements.mainElement && this.elements.mainElement.scrollTop > 0) {
            scrollTop = this.elements.mainElement.scrollTop;
        } 
        // Check window scroll (works on mobile and regular pages)
        else if (window.pageYOffset > 0) {
            scrollTop = window.pageYOffset;
        }
        // Check document scroll (alternative method)
        else if (document.documentElement.scrollTop > 0) {
            scrollTop = document.documentElement.scrollTop;
        }
        // If at #join hash, assume we're scrolled down
        else if (window.location.hash === '#join') {
            // Force a high scroll value to show button
            scrollTop = 999;
        }
        
        this.toggleScrollButton(scrollTop);
        this.invalidateCache();
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
