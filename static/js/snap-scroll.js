/**
 * Snap Scroll Manager Module
 * Fixes Windows wheel event issues with snap-scroll sections
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

const SnapScrollManager = {
    /**
     * Configuration
     */
    config: {
        throttleDelay: 100, // ms between scroll events
        wheelThreshold: 50, // minimum wheel delta to trigger scroll
        animationDuration: 800 // ms for smooth scroll animation
    },
    
    /**
     * State
     */
    state: {
        isScrolling: false,
        lastScrollTime: 0,
        wheelDeltaAccumulator: 0,
        currentSection: 0,
        totalSections: 0
    },
    
    /**
     * DOM Elements
     */
    elements: {
        mainElement: null,
        sections: []
    },
    
    /**
     * Cached measurements (to prevent forced reflow)
     */
    cache: {
        sectionPositions: [],
        viewportHeight: 0,
        needsUpdate: true
    },
    
    /**
     * Initialize snap scroll functionality
     */
    init: function() {
        // Only run on desktop with snap-scroll enabled
        if (window.innerWidth < 768) return;
        
        // Only activate on Windows - macOS handles snap-scroll perfectly with native CSS
        if (!this.isWindows()) return;
        
        this.cacheElements();
        
        if (!this.elements.mainElement || this.elements.sections.length === 0) {
            return; // No snap-scroll sections found
        }
        
        this.state.totalSections = this.elements.sections.length;
        this.bindEvents();
        this.detectCurrentSection();
    },
    
    /**
     * Detect if user is on Windows
     * @returns {boolean}
     */
    isWindows: function() {
        return navigator.platform.indexOf('Win') > -1 || 
               navigator.userAgent.indexOf('Windows') > -1;
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements: function() {
        this.elements.mainElement = document.querySelector('main');
        this.elements.sections = Array.from(document.querySelectorAll('section.snap-start'));
        this.updateCache();
    },
    
    /**
     * Update cached measurements (called on resize/init)
     */
    updateCache: function() {
        // Batch all reads together
        this.cache.viewportHeight = window.innerHeight;
        this.cache.sectionPositions = this.elements.sections.map(function(section) {
            return {
                top: section.offsetTop,
                bottom: section.offsetTop + section.offsetHeight
            };
        });
        this.cache.needsUpdate = false;
    },
    
    /**
     * Mark cache as needing update
     */
    invalidateCache: function() {
        this.cache.needsUpdate = true;
    },
    
    /**
     * Bind wheel and scroll events
     */
    bindEvents: function() {
        const self = this;
        
        // Handle wheel events with passive: false to prevent default on Windows
        if (this.elements.mainElement) {
            this.elements.mainElement.addEventListener('wheel', function(e) {
                self.handleWheel(e);
            }, { passive: false });
            
            // Track scroll position for current section detection
            this.elements.mainElement.addEventListener('scroll', function() {
                self.detectCurrentSection();
            }, { passive: true });
        }
        
        // Re-initialize on window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                self.invalidateCache();
                self.updateCache();
            }, 250);
        }, { passive: true });
    },
    
    /**
     * Handle wheel events with throttling and accumulation
     * @param {WheelEvent} e - Wheel event
     */
    handleWheel: function(e) {
        // Skip if already scrolling
        if (this.state.isScrolling) {
            e.preventDefault();
            return;
        }
        
        const now = Date.now();
        const timeSinceLastScroll = now - this.state.lastScrollTime;
        
        // Accumulate wheel delta
        this.state.wheelDeltaAccumulator += e.deltaY;
        
        // Only process if enough time has passed (throttle)
        if (timeSinceLastScroll < this.config.throttleDelay) {
            e.preventDefault();
            return;
        }
        
        // Check if accumulated delta exceeds threshold
        const direction = this.state.wheelDeltaAccumulator > 0 ? 1 : -1;
        const absAccumulated = Math.abs(this.state.wheelDeltaAccumulator);
        
        if (absAccumulated >= this.config.wheelThreshold) {
            e.preventDefault();
            
            // Determine target section
            const targetSection = this.state.currentSection + direction;
            
            // Check bounds
            if (targetSection >= 0 && targetSection < this.state.totalSections) {
                this.scrollToSection(targetSection);
            }
            
            // Reset accumulator and update time
            this.state.wheelDeltaAccumulator = 0;
            this.state.lastScrollTime = now;
        }
    },
    
    /**
     * Scroll to specific section with smooth animation
     * @param {number} sectionIndex - Index of target section
     */
    scrollToSection: function(sectionIndex) {
        const self = this;
        
        if (sectionIndex < 0 || sectionIndex >= this.cache.sectionPositions.length) return;
        
        this.state.isScrolling = true;
        this.state.currentSection = sectionIndex;
        
        // Use cached position instead of reading offsetTop
        const targetTop = this.cache.sectionPositions[sectionIndex].top;
        
        // Smooth scroll to section
        this.elements.mainElement.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
        
        // Reset scrolling flag after animation
        setTimeout(function() {
            self.state.isScrolling = false;
        }, this.config.animationDuration);
    },
    
    /**
     * Detect current section based on scroll position
     */
    detectCurrentSection: function() {
        if (this.state.isScrolling) return;
        
        // Update cache if needed
        if (this.cache.needsUpdate) {
            this.updateCache();
        }
        
        const scrollTop = this.elements.mainElement.scrollTop;
        const midPoint = scrollTop + (this.cache.viewportHeight / 2);
        
        // Find which section the midpoint is in using cached positions
        for (let i = 0; i < this.cache.sectionPositions.length; i++) {
            const pos = this.cache.sectionPositions[i];
            
            if (midPoint >= pos.top && midPoint < pos.bottom) {
                this.state.currentSection = i;
                break;
            }
        }
    },
    
    /**
     * Public method to scroll to next section
     */
    scrollNext: function() {
        if (this.state.currentSection < this.state.totalSections - 1) {
            this.scrollToSection(this.state.currentSection + 1);
        }
    },
    
    /**
     * Public method to scroll to previous section
     */
    scrollPrevious: function() {
        if (this.state.currentSection > 0) {
            this.scrollToSection(this.state.currentSection - 1);
        }
    }
};
