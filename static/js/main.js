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
        
        // Read phase: Check which modules exist
        const hasScrollManager = typeof ScrollManager !== 'undefined';
        const hasSnapScrollManager = typeof SnapScrollManager !== 'undefined';
        
        // Write phase: Initialize critical modules (already in RAF from DOMContentLoaded)
        if (hasScrollManager) {
            ScrollManager.init();
        }
        if (hasSnapScrollManager) {
            SnapScrollManager.init();
        }
        
        // Schedule non-critical modules after paint
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(function() { 
                self.initSecondaryModules(); 
            });
        } else {
            setTimeout(function() { 
                self.initSecondaryModules(); 
            }, 100);
        }
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
        this.height = window.innerHeight;
    }
};

/**
 * Initialize app when DOM is fully loaded
 * Use requestIdleCallback for maximum performance
 */
document.addEventListener('DOMContentLoaded', function() {
    // Cache viewport dimensions immediately (needed for layout)
    window.RedDawnViewport.update();
    
    // Defer app initialization until browser is idle
    // This ensures all JavaScript runs after critical rendering is complete
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(function() {
            RedDawnApp.init();
        }, { timeout: 2000 });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(function() {
            RedDawnApp.init();
        }, 1);
    }
    
    // Update viewport cache on resize (throttled)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            window.RedDawnViewport.update();
        }, 150);
    }, { passive: true });
});
