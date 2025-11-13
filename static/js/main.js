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
        const viewport = window.visualViewport;
        
        if (viewport) {
            this.width = viewport.width;
            this.height = viewport.height;
        } else {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }
        
        document.documentElement.style.setProperty('--vh', (this.height * 0.01) + 'px');
    }
};

/**
 * Schedule viewport updates to the next animation frame
 * Ensures multiple resize/scroll events are debounced
 */
const scheduleViewportUpdate = (function() {
    let rafId = null;
    
    return function() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(function() {
            rafId = null;
            window.RedDawnViewport.update();
        });
    };
})();

// Initialize CSS viewport variables as soon as possible
scheduleViewportUpdate();

// Listen to visual viewport changes (mobile address bar, PWA chrome)
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleViewportUpdate);
    window.visualViewport.addEventListener('scroll', scheduleViewportUpdate);
}

// Handle orientation changes fallback
window.addEventListener('orientationchange', function() {
    // Allow some time for viewport metrics to settle
    setTimeout(scheduleViewportUpdate, 60);
}, { passive: true });

/**
 * Initialize app when DOM is fully loaded
 * Use requestIdleCallback for maximum performance - all work deferred to idle time
 */
document.addEventListener('DOMContentLoaded', function() {
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
