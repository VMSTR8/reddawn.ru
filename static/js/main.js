/**
 * Main JavaScript Module
 * Core functionality for Red Dawn website
 * 
 * This module initializes all other modules and provides global utilities
 * 
 * @author Maxim VMSTR8 Vinokurov
 * @since 2025
 */

'use strict';

/**
 * Viewport Manager
 * Keeps viewport-dependent CSS variables stable across browsers
 */
const ViewportManager = {
    root: null,
    viewportHeight: 0,
    supportsDynamicUnits: false,
    resizeRafId: null,
    
    /**
     * Initialize viewport handling
     */
    init: function() {
        this.root = document.documentElement;
        this.supportsDynamicUnits = this.detectDynamicUnitSupport();
        this.updateCustomProperties();
        this.bindEvents();
    },
    
    /**
     * Detect support for modern viewport units
     * @returns {boolean}
     */
    detectDynamicUnitSupport: function() {
        if (typeof window.CSS === 'undefined' || typeof CSS.supports !== 'function') {
            return false;
        }
        
        return CSS.supports('height: 100dvh') || 
               CSS.supports('height: 100svh') || 
               CSS.supports('height: 100lvh');
    },
    
    /**
     * Bind resize and viewport change events
     */
    bindEvents: function() {
        const self = this;
        
        const scheduleUpdate = function() {
            self.queueUpdate();
        };
        
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        window.addEventListener('orientationchange', scheduleUpdate);
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', scheduleUpdate);
            window.visualViewport.addEventListener('scroll', scheduleUpdate, { passive: true });
        }
    },
    
    /**
     * Throttle viewport updates using rAF
     */
    queueUpdate: function() {
        if (this.resizeRafId) {
            return;
        }
        
        const self = this;
        this.resizeRafId = requestAnimationFrame(function() {
            self.updateCustomProperties();
            self.resizeRafId = null;
        });
    },
    
    /**
     * Update CSS variables with the latest viewport measurements
     */
    updateCustomProperties: function() {
        const height = this.getViewportHeight();
        const width = window.innerWidth || document.documentElement.clientWidth || 0;
        
        this.viewportHeight = height;
        
        if (this.root) {
            this.root.style.setProperty('--rd-viewport-height', height + 'px');
            
            if (!this.supportsDynamicUnits) {
                this.root.style.setProperty('--rd-vh', (height / 100) + 'px');
            } else {
                this.root.style.removeProperty('--rd-vh');
            }
        }
        
        if (window.RedDawnViewport) {
            window.RedDawnViewport.width = width;
            window.RedDawnViewport.height = height;
        }
    },
    
    /**
     * Get the current visual viewport height
     * @returns {number}
     */
    getViewportHeight: function() {
        if (window.visualViewport && typeof window.visualViewport.height === 'number') {
            return Math.round(window.visualViewport.height);
        }
        
        return Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
    }
};

/**
 * Main App Object
 * Namespace for all website functionality
 */
const RedDawnApp = {
    /**
     * Initialize all modules with optimized batching to prevent forced reflow
     */
    init: function() {
        const self = this;
        
        // Check which modules exist (no DOM access, fast)
        const hasScrollManager = typeof ScrollManager !== 'undefined';
        const hasSnapScrollManager = typeof SnapScrollManager !== 'undefined';
        
        // Defer module initialization to next animation frame
        // This separates module init from any potential parent reflow
        requestAnimationFrame(function() {
            // Initialize critical modules
            if (hasScrollManager) {
                ScrollManager.init();
            }
            if (hasSnapScrollManager) {
                SnapScrollManager.init();
            }
            
            // Schedule non-critical modules for even later
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(function() { 
                    self.initSecondaryModules(); 
                }, { timeout: 1000 });
            } else {
                setTimeout(function() { 
                    self.initSecondaryModules(); 
                }, 100);
            }
        });
    },
    
    /**
     * Initialize non-critical modules (stats, animations, forms)
     */
    initSecondaryModules: function() {
        // Batch all secondary module checks and inits
        requestAnimationFrame(function() {
            if (typeof StatsCounter !== 'undefined') {
                StatsCounter.init();
            }
            
            if (typeof EquipmentAnimator !== 'undefined') {
                EquipmentAnimator.init();
            }
            
            if (typeof FormHandler !== 'undefined') {
                FormHandler.init();
            }
            
            if (typeof MissionTimer !== 'undefined') {
                MissionTimer.init();
            }
        });
    }
};

/**
 * Global viewport cache (shared across all modules)
 * Prevents multiple window.innerWidth/innerHeight reads
 */
window.RedDawnViewport = {
    width: 0,
    height: 0,
    update: function() {
        this.width = window.innerWidth;
        this.height = ViewportManager.viewportHeight || ViewportManager.getViewportHeight();
    }
};

/**
 * Initialize app when DOM is fully loaded
 * Use requestIdleCallback for maximum performance - all work deferred to idle time
 */
document.addEventListener('DOMContentLoaded', function() {
    // Stabilize viewport units as early as possible
    ViewportManager.init();
    
    // Defer ALL initialization (including viewport cache) until browser is idle
    // This completely eliminates forced reflow during critical rendering path
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(function() {
            // Cache viewport dimensions when browser is idle
            window.RedDawnViewport.update();
            
            // Initialize app immediately after
            RedDawnApp.init();
        }, { timeout: 2000 });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(function() {
            window.RedDawnViewport.update();
            RedDawnApp.init();
        }, 1);
    }
    
    // Update viewport cache on resize (throttled and deferred)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Defer to next idle time
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(function() {
                    window.RedDawnViewport.update();
                });
            } else {
                window.RedDawnViewport.update();
            }
        }, 150);
    }, { passive: true });
});
